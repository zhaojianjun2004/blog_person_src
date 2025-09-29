---
title: 深入理解MVCC：多版本并发控制的实现原理
date: 
category: "database"
tags: ["Mysql","面试题","MVCC"]
---

> 在现代数据库系统中，如何在高并发环境下保证数据一致性、隔离性和高性能？MVCC 是解决这一问题的关键技术。本文将带你从零开始，深入剖析 MVCC 的实现原理。 

## 一、什么是 MVCC？

**MVCC（Multi-Version Concurrency Control，多版本并发控制）** 是一种用于实现数据库并发控制的机制。它允许读操作和写操作并发执行，而无需加锁阻塞对方，从而显著提升系统吞吐量和响应速度。

MVCC 的核心思想是：

> **为每个事务提供数据的一个“快照”（Snapshot），使得读操作看到的是事务开始时的数据版本，而不是当前可能被其他事务修改的最新值。** 

这使得“读不阻塞写，写不阻塞读”，非常适合 OLTP（在线事务处理）场景。

## 二、为什么需要 MVCC？

在没有 MVCC 的传统锁机制中：

- 读操作需要加共享锁（S Lock），写操作需要加排他锁（X Lock）。
- 读写互斥，写写互斥，容易造成锁竞争和阻塞。
- 高并发下性能急剧下降。

MVCC 通过“数据多版本”机制，避免了读写之间的锁冲突，同时还能支持不同的**事务隔离级别**（如 Read Committed、Repeatable Read）。

## 三、MVCC 的核心组件

要实现 MVCC，数据库系统通常需要以下几个关键组件：

### 1. 版本链（Version Chain / Undo Log）

每条记录（Row）在被更新时，并不会直接覆盖旧值，而是保留旧版本，并生成一个新版本。这些版本通过指针（通常是 Undo Log）串联成一个**版本链**。

- 每个版本记录包含：
  - 数据内容
  - 创建该版本的事务 ID（trx_id）
  - 删除该版本的事务 ID（可选，或使用单独的删除标记）
  - 指向更早版本的指针（roll_ptr）

> 📌 示例：
> 假设某行数据被事务 T1、T2、T3 依次修改，则版本链为：
> `T3版 ← T2版 ← T1版 ← 初始版` 

### 2. 事务 ID（Transaction ID）

每个事务在启动时会被分配一个唯一的、单调递增的事务 ID（如 InnoDB 中的 `trx_id`）。事务 ID 用于判断版本的“可见性”。

### 3. Read View（读视图）

当一个事务执行读操作时，会创建一个 **Read View**，用于决定哪些数据版本对该事务可见。

Read View 包含以下关键信息：

- `m_ids`：当前活跃（未提交）事务的 ID 列表。
- `min_trx_id`：`m_ids` 中的最小事务 ID。
- `max_trx_id`：下一个将要分配的事务 ID（即当前系统中最大事务 ID + 1）。
- `creator_trx_id`：创建该 Read View 的事务 ID（只读事务通常为 0）。

## 四、MVCC 如何判断版本可见性？

这是 MVCC 最核心的逻辑。数据库通过比较记录版本的 `trx_id` 与 Read View 中的信息，决定该版本是否对当前事务可见。

### 可见性判断规则（以 InnoDB 为例）：

假设当前记录版本的 `trx_id` 为 `V`，Read View 为 `R`：

1. **如果 `V < R.min_trx_id`**
   → 该版本由已提交事务创建，**可见**。
2. **如果 `V >= R.max_trx_id`**
   → 该版本由“未来”事务创建（启动时间晚于当前事务），**不可见**。
3. **如果 `V ∈ R.m_ids`（即 V 在活跃事务列表中）**
   → 该版本由未提交事务创建，**不可见**。
4. **如果 `V ∉ R.m_ids` 且 `R.min_trx_id <= V < R.max_trx_id`**
   → 该版本由已提交事务创建，**可见**。

> ✅ 简化记忆口诀：
> “早于最小活跃事务的，可见；晚于当前事务的，不可见；在活跃列表中的，不可见；其他已提交的，可见。” 

## 五、MVCC 在不同隔离级别下的行为

MVCC 的行为会因事务隔离级别不同而有所调整：

| 隔离级别         | ReadView创建时机          | 行为特点                         |
| ---------------- | ------------------------- | -------------------------------- |
| Read Uncommitted | 不使用 MVCC（直接读最新） | 可能读到未提交数据（脏读）       |
| Read Committed   | 每条 SELECT 语句前创建    | 每次读取都看到最新已提交版本     |
| Repeatable Read  | 事务第一次 SELECT 时创建  | 整个事务中看到的数据版本保持一致 |
| Serializable     | 通常退化为加锁            | 严格串行，避免幻读               |

> ⚠️ 注意：MySQL InnoDB 默认隔离级别是 **Repeatable Read**，其 MVCC 行为保证了可重复读，但对“当前读”（如 `SELECT ... FOR UPDATE`）仍会加锁。 

## 六、MVCC 实现示例（InnoDB）

我们以 MySQL InnoDB 引擎为例，看看 MVCC 是如何落地的。

### 1. 隐藏列

InnoDB 为每一行数据隐式添加了三个系统列（用户不可见）：

- `DB_TRX_ID`：最近修改该行的事务 ID。
- `DB_ROLL_PTR`：指向 Undo Log 中上一个版本的指针。
- `DB_ROW_ID`：行 ID（当表无主键时使用）。

### 2. Undo Log

Undo Log 用于存储旧版本数据。当 UPDATE 或 DELETE 发生时：

- 旧版本数据写入 Undo Log。
- 当前记录的 `DB_ROLL_PTR` 指向该 Undo 记录。
- 形成版本链。

Undo Log 是“逻辑日志”，记录的是如何逆向操作（如：UPDATE 前的值）。

> 🧹 **Purge 线程**：后台线程定期清理不再被任何事务需要的旧版本（即没有 Read View 依赖的版本），释放空间。 

### 3. Read View 创建时机

- **RC 级别**：每次执行 SELECT 前创建新的 Read View。
- **RR 级别**：事务中第一次 SELECT 时创建，后续复用。

> 两种隔离级别下的ReadView图示：

#### 3.1、事务隔离级别为RC（读已提交隔）：

![img](https://raw.githubusercontent.com/zhaojianjun2004/picGo/master/img/74171c5081814cddbbb20235df04ae76%7Etplv-k3u1fbpfcp-zoom-in-crop-mark%3A1512%3A0%3A0%3A0.awebp)



#### 3.2、事务隔离级别为RR（可重复读）：

![img](https://raw.githubusercontent.com/zhaojianjun2004/picGo/master/img/17d7f276a34b4d84ae022218d161b510%7Etplv-k3u1fbpfcp-zoom-in-crop-mark%3A1512%3A0%3A0%3A0.awebp)



> 参考链接：[深入理解MySQL的MVCC原理介绍MySQL的MVCC实现初衷（为什么要有MVCC）、实现原理（是如何实现的）、MVC - 掘金](https://juejin.cn/post/7066633257781035045)