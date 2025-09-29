---
title: mysql事务是什么？如何与Spring集成的？
date:
updated:
category: "database"
tags: ["mysql","面试题"]
---

### 1.什么是事务？

**事务**是一组原子性的 SQL 操作序列，要么全部成功执行，要么全部不执行。用于保证数据库在多个操作之间的一致性。

#### 示例场景：

银行转账：A 账户转 100 元给 B 账户

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE user_id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE user_id = 'B';
COMMIT;
```

如果其中任意一条语句失败（比如 B 账户不存在），整个操作应被回滚，确保资金不会凭空消失或重复增加

### 2.事务的四大特性（ACID）

这是事务最核心的理论基础：

| 特性                      | 含义                                 | 说明                                                         |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| **Atomicity（原子性）**   | 不可分割的最小单位                   | 事务中的所有操作要么全做，要么全不做。即使中间发生崩溃，也要恢复到事务开始前的状态。 |
| **Consistency（一致性）** | 数据库从一个一致状态到另一个一致状态 | 事务执行前后，数据库必须满足所有预定义的约束（如外键、唯一性、检查约束等）。 |
| **Isolation（隔离性）**   | 多个事务并发执行时互不干扰           | 一个事务的中间状态对其他事务不可见，避免脏读、幻读等问题。   |
| **Durability（持久性）**  | 一旦提交，结果永久保存               | 即使系统崩溃，已提交的事务结果也不会丢失（靠 redo log 和磁盘写入保证）。 |

> ✅ ACID 是关系型数据库区别于 NoSQL 的关键特征之一。 

### 3.事务的生命周期

一个事务通常包含以下几个阶段：

1. **开始事务（BEGIN / START TRANSACTION）**
   - 显式开启：`START TRANSACTION;`
   - 隐式开启：某些语句（如 INSERT/UPDATE/DELETE）在自动提交关闭时自动触发事务。
   - 注意：MySQL 默认是 `autocommit=ON`，每条语句都是独立事务。
2. **执行 SQL 操作**
   - 执行一系列 DML（INSERT、UPDATE、DELETE）或 DDL（注意：DDL 会隐式提交！）
   - 可以包含 SELECT（只读，不影响事务状态）
3. **提交（COMMIT）或回滚（ROLLBACK）**
   - `COMMIT`：提交所有更改，永久生效。
   - `ROLLBACK`：撤销所有未提交的操作，恢复到事务开始前的状态。
4. **结束**
   - 提交或回滚后，事务结束，资源释放。

> ⚠️ 注意：DDL 语句（如 CREATE TABLE, DROP TABLE, ALTER TABLE）会**隐式提交当前事务**！ 

```sql
START TRANSACTION;
INSERT INTO t1 VALUES (1);
CREATE TABLE t2 (...); -- 这里隐式 COMMIT！前面的 INSERT 已经无法回滚了！
ROLLBACK; -- 无效，t1 的插入已提交
```

### 4.事务的隔离级别（Isolation Levels）

MySQL 支持四种标准的事务隔离级别，由 SQL 标准定义。不同级别解决不同的并发问题。

> 隔离级别使用`Isolation.REPEATABLE_READ`开启

| 隔离级别                         | 脏读   | 不可重复读 | 幻读                                | 默认隔离级别   |
| -------------------------------- | ------ | ---------- | ----------------------------------- | -------------- |
| **READ UNCOMMITTED**（读未提交） | ❌ 允许 | ❌ 允许     | ❌ 允许                              |                |
| **READ COMMITTED**（读已提交）   | ✅ 禁止 | ❌ 允许     | ❌ 允许                              | （Oracle默认） |
| **REPEATABLE READ**（可重复读）  | ✅ 禁止 | ✅ 禁止     | ❌ 允许（但InnoDB用MVCC+间隙锁解决） | （MySQL默认）  |
| **SERIALIZABLE**（串行化）       | ✅ 禁止 | ✅ 禁止     | ✅ 禁止                              |                |

#### 1. 脏读（Dirty Read）

- 一个事务读取了另一个**未提交事务**修改的数据。
- 如果那个事务后来回滚，你读到的就是“脏数据”。

#### 2. 不可重复读（Non-repeatable Read）

- 在同一个事务中，两次读取同一行数据，结果不一致（因为其他事务修改并提交了该行）。
- 关注的是**数据被修改**。

#### 3. 幻读（Phantom Read）

- 在同一个事务中，两次查询返回的**行数不一样**（因为其他事务插入或删除了符合查询条件的行）。
- 关注的是**新行出现或消失**。

> 💡 注意：MySQL InnoDB 引擎通过 **多版本并发控制（MVCC） + 间隙锁（Gap Lock）** 实现了在 REPEATABLE READ 下“禁止幻读”，这是它与标准 SQL 的一个重要区别。 

##### ✅ MySQL InnoDB 的特殊处理：

- 在 `REPEATABLE READ` 下，InnoDB 使用 **快照读（Snapshot Read）** 来避免不可重复读。
- 对于当前读（`SELECT ... FOR UPDATE / LOCK IN SHARE MODE / UPDATE / DELETE`），会加**间隙锁（Gap Lock）** 或 **临键锁（Next-Key Lock）**，从而防止其他事务插入新记录，避免幻读。

### 5.MySQL 事务的实现原理（InnoDB）

#### 1. Undo Log（回滚日志）

- 用于实现**原子性**和**一致性**。
- 存储旧版本数据，支持事务回滚和 MVCC 快照读。
- 当事务回滚时，用 undo log 恢复原值。
- 也用于构建一致性视图（Read View）。

#### 2. Redo Log（重做日志）

- 用于实现**持久性**。
- 记录物理页的修改，即使系统崩溃，重启后也能通过 redo log 恢复已提交事务。
- 循环写入，顺序 I/O，性能极高。
- 在 commit 前必须先写入 redo log（WAL：Write-Ahead Logging）。

#### 3. MVCC（多版本并发控制）

- 通过隐藏字段 `DB_TRX_ID`（事务ID）、`DB_ROLL_PTR`（回滚指针）实现。
- 每次更新生成新版本，旧版本保留在 undo log 中。
- 每个事务启动时创建一个“一致性视图”（Read View），决定能看到哪些版本。
- 无需加锁即可实现高并发读。

> ✅ MVCC 是 InnoDB 实现高性能读写分离的关键！ 

#### 4. 两阶段提交（2PC）

- 为了保证 redo log 和 binlog 的一致性（主从复制前提）。
- 分为：
  1. Prepare 阶段：写入 redo log（prepare 状态）
  2. Commit 阶段：写入 binlog，再标记 redo log 为 commit

> ⚠️ 如果 crash 发生在 prepare 和 commit 之间，MySQL 通过 binlog 恢复判断是否提交。 

### 6.事务与 Spring 的集成

Spring框架对数据库事务提供了两种管理方式，分别是**声明式（Declarative）和编程式（Programmatic）**。在现代 Java 开发中，**声明式事务（基于注解）是绝对主流**，但理解其背后原理和手动控制方式至关重要。

#### 1. Spring 事务管理的核心思想

Spring 并不自己实现事务，而是**封装了底层数据源（如 MySQL InnoDB）的事务能力**，通过 AOP（面向切面编程）在方法调用前后自动插入事务控制逻辑：

- **开始事务** → 执行业务方法 → 提交/回滚事务
- 由 `PlatformTransactionManager` 接口统一管理不同数据源的事务（JDBC、JPA、MyBatis 等）
- 默认使用 `DataSourceTransactionManager`（针对 JDBC/MyBatis）

> ✅ Spring 事务的本质：**AOP + 代理 + 数据库原生事务** 

#### 2. 声明式事务：@Transactional 注解（最常用）

##### ✅ 基本用法

```java
@Service
public class AccountService {

    @Autowired
    private AccountMapper accountMapper;

    //  声明事务：方法内所有数据库操作在一个事务中
    @Transactional
    public void transfer(String from, String to, BigDecimal amount) {
        accountMapper.reduceBalance(from, amount);   // 扣款
        int i = 1 / 0;                               // 模拟异常
        accountMapper.increaseBalance(to, amount);   // 加款 —— 不会执行
    }
}
```

- 当 `transfer()` 方法抛出**未检查异常（RuntimeException）或 Error** 时，Spring 会**自动回滚事务**。
- 如果抛出的是**受检异常（Checked Exception）**，默认**不会回滚**！

##### 🚫 默认行为陷阱

```java
@Transactional
public void transfer(String from, String to, BigDecimal amount) throws Exception {
    accountMapper.reduceBalance(from, amount);
    throw new SQLException("网络错误"); // ❌ 受检异常，事务不会回滚！
    accountMapper.increaseBalance(to, amount);
}
```

###### ✅ 解决方案：指定回滚规则

```java
@Transactional(rollbackFor = Exception.class)
public void transfer(String from, String to, BigDecimal amount) throws Exception {
    ...
}
```

或更精确：

```java
@Transactional(
    rollbackFor = {SQLException.class, RuntimeException.class},
    noRollbackFor = {IllegalArgumentException.class} // 某些异常不回滚
)
```

#### 3. @Transactional 的关键属性详解

##### 🔥 传播行为（Propagation）

> 事务传播行为用来描述由某一个事务传播行为修饰的方法被嵌套进另一个方法时事务如何传播。
>
> 示例：
>
> ```java
>  public void methodA(){
>     methodB();
>     //doSomething
>  }
>  
>  @Transaction(Propagation=XXX)
>  public void methodB(){
>     //doSomething
>  }
> ```
>
> 代码中`methodA()`方法嵌套调用了`methodB()`方法，`methodB()`的事务传播行为由`@Transaction(Propagation=XXX)`设置决定。这里需要注意的是`methodA()`并没有开启事务，某一个事务传播行为修饰的方法并不是必须要在开启事务的外围方法中调用。

| 枚举值             | 行为                                              | 场景举例                                             |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------- |
| `REQUIRED`（默认） | 如果存在事务则加入，否则新建                      | 大多数业务方法都用这个                               |
| `REQUIRES_NEW`     | 无论是否存在，都挂起当前事务，新建一个            | 日志记录、发送短信等独立操作，即使主事务失败也要提交 |
| `SUPPORTS`         | 有事务就加入，没有就非事务执行                    | 查询类方法，无状态                                   |
| `NOT_SUPPORTED`    | 挂起当前事务，以非事务方式执行                    | 调用外部 API、文件写入                               |
| `MANDATORY`        | 必须在已有事务中运行，否则报错                    | 内部服务强制要求事务上下文                           |
| `NEVER`            | 不能在事务中运行，否则报错                        | 某些系统监控接口                                     |
| `NESTED`           | 如果存在事务，则在嵌套事务内执行；否则像 REQUIRED | 实现局部回滚（类似 SAVEPOINT）                       |

##### 📌 示例：REQUIRES_NEW vs REQUIRED

```java
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private LogService logService;

    @Transactional
    public void createOrder(Order order) {
        orderMapper.insert(order); // 1. 插入订单

        // 2. 记录日志：即使订单失败，日志也要保留
        logService.logOrderCreated(order.getId()); // 使用 REQUIRES_NEW
    }
}

@Service
public class LogService {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logOrderCreated(Long orderId) {
        logMapper.insert(new Log("创建订单: " + orderId));
        // 如果这里抛异常，不会影响主事务，但自己的事务会回滚
    }
}
```

> 💡 `REQUIRES_NEW` 会**开启新连接、新事务**，适用于**独立审计、异步通知、失败不影响主流程**的场景。 

##### ⚠️ 注意：同一个类内部调用导致事务失效！

```java
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Transactional
    public void updateUser(User user) {
        userMapper.update(user);
        updateLog(); // ❌ 这里是 this 调用，不经过代理，事务失效！
    }

    @Transactional
    public void updateLog() {
        logMapper.insert("用户更新");
    }
}
```

> ✅ **原因**：Spring 事务是通过代理实现的，`this.updateLog()` 是直接调用对象自身方法，**绕过了 Spring AOP 代理**，所以事务注解无效！ 

###### ✅ 正确做法：

```java
// 方式1：注入自己（推荐）
@Autowired
private UserService self;

@Transactional
public void updateUser(User user) {
    userMapper.update(user);
    self.updateLog(); // ✅ 经过代理，事务生效
}

// 方式2：使用 ApplicationContext 获取代理
@Autowired
private ApplicationContext context;

@Transactional
public void updateUser(User user) {
    userMapper.update(user);
    context.getBean(UserService.class).updateLog();
}

// 方式3：提取到另一个 Service 中
```

#### * 4. 编程式事务：手动控制事务

当你的业务逻辑复杂、需要动态决定是否回滚、或无法使用注解时，可使用编程式事务。

##### ✅ 使用 TransactionTemplate（推荐）

```java
@Service
public class OrderService {

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Autowired
    private OrderMapper orderMapper;

    public void createOrderWithManualTx(Order order) {
        transactionTemplate.execute(status -> {
            try {
                orderMapper.insert(order);
                // 模拟条件判断
                if (order.getAmount().compareTo(BigDecimal.valueOf(1000)) > 0) {
                    status.setRollbackOnly(); // ✅ 手动标记回滚
                }
                return "success";
            } catch (Exception e) {
                status.setRollbackOnly();
                throw e; // 或者记录日志后重新抛出
            }
        });
    }
}
```

##### ✅ 使用 PlatformTransactionManager（原始方式）

```java
@Service
public class OrderService {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private OrderMapper orderMapper;

    public void createOrderWithRawTx(Order order) {
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);

        TransactionStatus status = transactionManager.getTransaction(def);

        try {
            orderMapper.insert(order);
            transactionManager.commit(status);
        } catch (Exception e) {
            transactionManager.rollback(status);
            throw new RuntimeException("订单创建失败", e);
        }
    }
}
```

> ⚠️ 编程式事务代码冗长，一般只用于： 
>
> - 动态决定是否开启事务
> - 在循环中逐条提交（如批量导入）
> - 需要精细控制隔离级别、超时等

#### 5.多数据源事务管理（分布式事务入门）

如果项目中有多个数据库（如主库 + 读库、订单库 + 用户库），默认情况下每个 `DataSource` 有自己的 `PlatformTransactionManager`，**单个 @Transactional 只能管理一个数据源**。

##### ❌ 错误示例：

```java
@Transactional
public void createOrderAndUser(Order order, User user) {
    orderDbMapper.insert(order);     // 数据源1
    userDbMapper.insert(user);       // 数据源2 —— ❌ 两个不同事务！
}
```

> 如果订单成功、用户失败，订单不会回滚！→ **数据不一致！** 

##### ✅ 解决方案：

###### 最终一致性（推荐）—— 消息队列补偿

![image-20250912114510470](https://raw.githubusercontent.com/zhaojianjun2004/picGo/master/img/image-20250912114510470.png)

- 用 RabbitMQ/Kafka + 消息表 + 重试机制保证最终一致。
- 适合电商、物流等高并发场景。

