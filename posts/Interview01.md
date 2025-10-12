---
title: 【面试题】美团后端面经（分享）
date: 2025-10-02
updated: 2025-10-08
category: interview
tags:
  - "java"
  - "面经"	
---

### **一、为什么string不可变？StringBuffer可变？**

1. String不可变：

从设计上来说：

- String的源码中，value字符数组被final关键字修饰，一旦初始化就不能被指向其他数组
- 对于其他的看似”修改“的方法，比如`substring()`，`contat()`，实际上都返回新的String对象

对于String来说，不可变的好处是：

- 线程安全，多个线程共享同一个string对象无需同步
- 字符串常量池：JVM可以安全的重用相同的字符串字面量
- 安全性较高：防止恶意代码修改敏感字符串（如数据库连接字符串）



2. StringBuffer可变的原因：

从设计上来说：

- StringBuffer的value字符数组**没有被final修饰，**
- 所有的修改方法都直接操作内部数组，返回同一个对象引用。

可变性的好处：

- 性能优化：对于频繁字符串拼接时避免创建大量临时对象
- 内存效率：在大量修改的场景下更节约内存。

### **二、synchronized 和 Reentranlock详细介绍，哪些情况优先使用后者，或者说为什么解决什么问题而存在？**

> synchronized和ReentrantLock都是解决线程同步问题的常用方法。都能保证原子性、可见性、有序性。

#### synchronized：

- 实现方式：是**java的关键字**，是jvm原生支持的，适用起来比较方便。
- 灵活性：操作基本上都是底层自动实现，比如锁的获取与释放，相对来说，灵活性较差。默认适用的**非公平锁**，**默认阻塞死等**、**不可中断**
- 底层机制：早期适用重量级锁实现，monitor监视器依赖操作系统。从jdk1.6之后对其优化引入了偏向锁、轻量级锁、自旋锁，性能提升巨大，基本上和reentrantLock差不多。
- 条件变量：synchronized只能配合wait()/notify()/notifyAll()做线程通信，一个锁只能有一个等待集合，相对来说不够灵活
- 预防死锁：synchronized的最大优点就是可以自动释放锁，不容易死锁

#### ReentrantLock:

- 实现方式：ReentrantLock是**jdk层面的**，具体是locks包中的内容，需要手动new，手动lock（）和unlock（）
- 灵活性：可以手动控制锁的获取和释放，手动tryLock()，支持**可中断获取锁**，支持**超时获取锁**（超时就不要了），还可以选**公平锁或非公平锁**。
- 底层实现机制：reentrantLock底层是用的**AQS**，靠CAS+队列+park/unpark（lockSupport）实现，不依赖操作系统，更轻量可控。
- 条件变量：reentrantLock配合condition对象，一个锁可以搞**多个condition**，比如生产线程一个condition，消费线程一个condition，最后signal()精准唤醒，避免无效唤醒。
- 预防死锁：reentrantLock需要手动unlock()，如果忘记释放锁了，就会导致死锁问题，所以**一般配合try-finally**。

ReentrantLock的设计意图在于：

- **提供更灵活的锁控制**
- **支持高级同步场景**
- **更好的性能调优能力**

优先使用ReentrantLock的场景：

- 需要可中断的锁操作
- 实现更复杂的同步结构（比如涉及到生产者、消费者精确唤醒的场景）
- 需要公平锁语义
- 需要锁的调试信息等

### 三、关于上面的锁，有哪些注意事项？

#### **Synchronized:**

1. 为避免死锁问题，我们一般始终按照相同顺序获取锁
2. 关于锁的对象选取，我们一般选用`object`类型，不要锁自动装箱类、`string`类型的对象（`String` 字面量在常量池中，可能会被多个不相关的代码块共享，导致意外的同步。自动装箱类（如 `Integer`, `Long`）对象在运算过程中**可能被重新创建**，导致每次锁的都是**不同的对象**，同步失效）。还有就是尽量不要锁this（ 除非确定整个对象的粒度是合适的。锁 `this` 意味着整个对象的所有同步方法都会被阻塞，**粒度较大**  ）

```java
private final Object lock = new Object(); // 推荐方式
```

3. 锁的粒度根据实际场景选用最合适的（**过粗**的粒度（如锁整个方法、锁 `this`）会导致并发度低，性能差。**过细**的粒度可能增加代码复杂度，甚至可能无法保证临界区代码的原子性）
4. 避免在synchronized块中调用外部方法，将方法调用移到同步块外边（ 如果调用的外部方法内部也存在同步或锁操作，可能会导致**死锁**（如果形成循环等待）或**活锁**，同时也会增加对外部方法副作用的风险。  ）

#### **ReentrantLock:**

1. 避免死锁：

- 确保释放锁：使用`try-finally`结构
- 给获取锁设置**超时时间**（`tryLock`），根据`tryLock`的返回结果来动态判定是否执行后续代码，避免在无锁的情况下执行临界区代码

```java
public void method() {
    if (lock.tryLock()) {
        try {
            // 临界区代码
        } finally {
            lock.unlock();
        }
    } else {
        // 处理获取锁失败的情况
    }
}
```

2. 注意`lock`和`unlock`的数量对应，避免重复释放锁，否则会抛出异常`IllegalMonitorStateException`（如果当前线程不持有锁时调用  ）

> 注意：公平锁会有额外的开销，`reentrantLoc`k默认使用的非公平锁

### 四、join 类型

`JOIN` 是 SQL 中最核心的概念之一，用于**根据两个或多个表中的相关列，将这些表中的行组合起来**。  

#### 1. INNER JOIN（内连接）

 只返回那些在两个表中**都存在匹配**关系的行。  

#### 2. LEFT JOIN（左外连接）

返回**左表**中的所有行，以及**右表**中与连接条件匹配的行  

#### 3. RIGHT JOIN（右外连接）

（比较少用）--- left join+表顺序反转实现

返回**右表**中的所有行，以及**左表**中与连接条件匹配的行  

#### 4. FULL OUTER JOIN（全外连接） --> **mysql不支持**

返回当左表和右表都没有匹配项时，也会被返回

mysql使用union实现  

```sql
SELECT a.*, b.*
FROM A LEFT JOIN B ON A.id = B.id
UNION
SELECT a.*, b.*
FROM A RIGHT JOIN B ON A.id = B.id
WHERE A.id IS NULL;
```

#### 5. CROSS JOIN（交叉连接）

返回两个表中所有行的**笛卡尔积**。如果 A 表有 m 行，B 表有 n 行，则结果集有 m×n 行。通常在没有 `WHERE` 或 `ON` 条件时使用  

#### 6. SELF JOIN（自连接）

指**一个表与自身进行连接**。它通常用于处理**层级数据（比如经理与对应员工）**或比较同一表中的不同行。实现时需为表设置**别名**

```sql
-- 查询每个员工及其经理姓名
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

### 五、SQL优化方案

#### 单表优化：

1. **索引优化**：

- 对于一些**高频查询**字段添加索引，同时尽量做好工作**避免索引失效**。
- 对于非聚集索引，避免回表查询。尽量**覆盖索引**
- 定期使用**explain分析执行计划**。
- 合理选择**聚集索引**（聚集索引对于数据写入和范围查询非常重要，一般使用自增id/uuid等单调递增的值）

2. **SQL语句优化**：

- 避免select * 的使用，尽量标明 查询的字段（而对于`COUNT`，我们使用`COUNT(*)`，而不具体某个列， 否则 `COUNT(*)` 效率更高，它会交给优化器去选择最快的计数方式 ）
- 避免深度分页的问题，比如 limit 10w,1（解决方案使用上次查询的最大主键值，避免offset）
- **避免子查询和多层嵌套查询：** 很多情况下，**子查询**可以通过 `JOIN` 或 `UNION` 等方式改写，从而提高性能。  
- 使用批量操作方式的优化

3. **表结构优化**：

- 单表尽量**不要有太多字段**，但是为了减少高频查询时的 `JOIN` 次数，可以牺牲部分存储空间，适度增加**冗余字段**（如将用户名称存储在订单表中），以提高查询速度。
-  使用能存下数据的最小的数据类型，（对数字精确度要求较高的，使用`DECIMAL`类型， 避免使用 `FLOAT` 或 `DOUBLE` 存储  ）
- 尽量使用`not null`定义字段，减少`null`字段的使用，否则影响索引效率、增加查询复杂度

4. **慢日志查询分析**：

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- 超过1秒的查询

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log_file';
```

#### 多表优化：

1. **分库分表**：垂直分和水平分两种方式

**（考虑分片的策略：** 分库分表的核心在于分片键的选择。应根据业务特性选择**高频查询**或**能分散读写压力**的字段作为分片键，如用户 ID、订单 ID 等。同时需要考虑**分布式事务**和**跨库 JOIN** 的处理方案（使用分布式事务中间件）。）  

2. **读写分离**：一般来说，对于数据库都是读多写少，多数的数据库压力来源于大量的读取访问。可以采用集群的方式，一个库作为主库，负责写入数据；其他的从库，负责读取数据，这样可以缓解对数据库的访问压力。

（**主从延迟（Replication Lag）的处理：** 读写分离带来的核心问题是主从数据同步延迟。需要有一个策略来处理对**实时性要求高**的查询，例如： **短期内强制走主库查询**；或 **查询后立即写入缓存**。  ）

3. Redis缓存热点数据（区分全量缓存和部分缓存），减少DB查询

### 六、查看执行计划

 执行计划是数据库优化器为查询语句生成的**路线图**，它详细说明了数据库将**如何读取表**、**使用哪些索引**、**以什么顺序连接表**以及**如何处理排序和分组**。  

#### 查看执行计划：

```
Explain [SQL语句]
```

#### 查看执行计划的几种方式：

1. `explain`

- 显示 MySQL 如何执行 SQL 语句，包括表的读取顺序、使用的索引、扫描行数等
- **特点**：**不实际执行 SQL**，只返回执行计划

2. `explain format=json`(更详细)

- 以 JSON 格式返回**更详细**的执行计划信息

3. `explain analyze`(Mysql 8+)

- **实际执行 SQL** 并返回执行计划 + **真实执行时间、循环次数等运行时统计信息**
- **特点**：会真正执行查询，适合生产环境谨慎使用

4. `show warnings`(配合explain)

```sql
EXPLAIN SELECT * FROM users WHERE id = 1;
SHOW WARNINGS; -- 显示优化器重写后的 SQL
```

- **作用**：查看 MySQL 优化器对原始 SQL 的重写结果

#### 关键输出项：

1. `type`

这是**最重要**的指标，它表示数据库是如何查找表中行数据的。从最好到最差的顺序是：

| Type 值          | 含义                             | 性能     | 描述                                                       |
| ---------------- | -------------------------------- | -------- | ---------------------------------------------------------- |
| `system/ `const` | 找到了常数行                     | **极好** | 表中只有一行匹配，或查询被优化为常数。                     |
| `eq_ref`         | 仅使用主键或唯一索引查找一行数据 | **很好** | 通常用于 `JOIN`操作，效率高。                              |
| `ref`            | 使用非唯一索引进行查找           | **好**   | 返回所有匹配条件的行。                                     |
| `range`          | 索引范围扫描                     | **中等** | 索引用于给定范围的查询，如 `BETWEEN`或 `>`, `<`。          |
| `index`          | 全索引扫描                       | **较差** | 遍历整个索引来获取数据，比 `ALL`好，因为它只扫描索引文件。 |
| `ALL`            | **全表扫描**                     | **最差** | 遍历整个表来找到匹配的行。**优化目标是消除** `ALL`**。**   |

1. `possible_keys` (可能使用的索引)  

 显示数据库在查找数据时**可能**会考虑使用的索引。  

2. `key` (实际使用的索引)  

 显示数据库**最终决定**使用的索引。

- **注意**：`possible_key` 有值但 `key` 为 `NULL`，说明优化器认为全表扫描更快

3. `rows` (扫描行数)  

 这是数据库**估计**需要读取的行数。这个数字越小越好，它直接反映了查询的效率。  

4. `Extra` (额外信息)  

提供了**查询优化器决策**的额外细节，需要关注以下几种情况：

- `Using filesort`：数据库需要对结果进行额外的**排序操作**，通常会消耗大量时间。这说明 `ORDER BY` 字段没有被索引覆盖。
- `Using temporary`：数据库需要创建**临时表**来处理查询（通常发生在复杂的 `GROUP BY` 或 `DISTINCT` 操作中）。这也会显著降低性能。
- `Using index`：**极佳**。表示查询所需的所有列都包含在索引中（**覆盖索引**），数据库不需要访问数据行本身，避免了**回表**操作。

### 七、自动装配原理？流程

**自动装配原理**：本质是springboot在项目启动时，根据项目中添加的<u>依赖（starter）</u>、<u>类路径下的文件</u>、以及<u>配置属性</u>等条件，自动为我们配置所需要的bean并且将它们注册到spring的IoC容器中。

核心机制依赖几个关键组件与注解：

1. `SpringBootApplication`注解：这是springboot应用的总入口点。这是一个组合注解，内部包含了:

- `EnableAutoConfiguration`：这是启用自动装配的关键注解。它会促使springboot扫描类路径下的所有自动配置类
- `ComponentScan`：默认扫描主配置类所在的包及其子包下的组件（`@controller`,`@service`等）
- `Configuration`：声明当前类是一个配置类

2. `spring.factories`文件：每个Starter依赖内部的`spring-boot-autoconfigure`模块中，都会在`META/INF`目录下包含一个`spring.factories`文件，这个文件里面记录了所有的自动配置类的**全限定名**。而这个文件在springboot 3之后完全替换为了`AutoConfiguration.imports`。这个新文件的内容格式上做了一些改变，每行一个全限定类名，纯文本格式，直接读取文件行，而无需解析`properties`格式。这个改变也是为了让自动配置职责转移到新的文件，让`spring.factories`文件专注于非自动配置SPI。
3. **自动配置类**：这些类是自动配置的关键所在。通过`@Configuration`来标识spring自动配置类。在这些类的内部，会使用`@Bean`来定义需要装配到IoC容器中的Bean。
4. **条件注解**：这是springboot自动配置的开关，通过一系列`@ConditionOnxxx`注解来决定一个自动配置类或一个Bean是否应该生效：比如

- `@ConditionOnClass`：只有当类路径下包含指定的Class类，配置才生效
- `@ConditionOnMissingBean`：只有当IoC容器中不包含指定的Bean时，配置才生效
- `@ConditionOnProperty`：只有当指定的配置属性存在且匹配值的时候，配置才生效

**自动装配的流程**：

自动装配流程起始于`@SpringBootApplication`注解，这个注解内部包含了一个`@EnableAutoConfiguration`，正是它触发了自动配置机制。启动时,`AutoConfigurationImportSelector`加载所有需要配置的类，早期版本这些自动配置类的全限定名被记录在各个starter依赖的`META-INF/spring.factories`文件中，而在springboot2.7之后，官方逐渐迁移到了更简洁的`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件中，采用纯文本格式每行记录一个全限定类名。`AutoConfigurationImportSelector`会读取这些文件，收集到所有的自动配置类，然后将他们交给spring容器去处理。但并不是所有的自动配置类都会被真正注册为bean，springBoot还会通过一些条件注解（比如`ConditionOnclass`、`ConditionOnMissionBean`、`ConditionOnProperty`等）来判断当前环境是否满足各个配置类的生效条件。只有当所有条件都满足的时候，对应的自动配置类才会被实例化，其中定义的Bean才能被注册到spring容器中。这样就实现了“按需分配”的效果。

### 八、设计模式应用，好处

#### spring/springboot框架中的设计模式应用

spring框架本身就是一个设计模式的集大成者，其核心思想（Ioc/AOP）就是对多种设计模式的巧妙应用

| 模式类别   | 设计模式                       | 在spring/springboot中的应用                                  | 好处/目的                                                    |
| ---------- | ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **创建型** | **工厂模式 (Factory)**         | IoC 容器：`BeanFactory`或`ApplicationContext`是一个巨大的工厂，负责 Bean 的创建、管理和生命周期。它根据配置文件或注解动态实例化对象。 | 将对象的创建与使用分离，方便统一管理和替换实现类。           |
| **创建型** | **单例模式 (Singleton)**       | Spring Bean 默认作用域：默认情况下，所有 Spring Bean 都是单例的，容器中只存在一个实例。 | 节省内存开销，避免重复创建资源消耗大的对象，提高性能。       |
| **结构型** | **代理模式 (Proxy)**           | AOP（面向切面编程）：Spring 通过 JDK 动态代理（针对接口）或 CGLIB 代理（针对类）来为目标 Bean 生成代理对象，从而在不修改原有代码的情况下，织入事务、日志、安全等横切逻辑。（代理模式在`@Transactional`、`@Cacheable`等注解有广泛应用） | 实现无侵入式的增强，是 AOP 的核心。                          |
| **行为型** | **模板方法 (Template Method)** | Template 家族：如`JdbcTemplate`、`RestTemplate`、`JmsTemplate`。它们定义了执行操作的固定骨架（如打开连接、执行 SQL、关闭连接），将具体细节（如创建 Statement、处理 ResultSet）留给用户实现。 | 封装不变的流程，将可变细节延迟到子类或回调函数中，避免重复代码。 |
| **行为型** | **观察者模式 (Observer)**      | Spring 事件机制：`ApplicationEvent`（事件）和`ApplicationListener`（监听者）。当发布一个事件时（`ApplicationContext.publishEvent()`），所有感兴趣的监听器都会被通知和执行。 | 实现对象间的松耦合通知机制，用于模块间的解耦，如用户注册后发送邮件。 |
| **结构型** | **适配器模式 (Adapter)**       | Spring MVC：`HandlerAdapter`根据不同的处理器（如实现`Controller`接口或使用`@RequestMapping`注解）选择合适的策略来执行方法。 | 统一不同的接口类型，使得框架可以同时支持多种类型的处理器。   |

#### 项目中的设计模式应用

##### 一、策略模式 (Strategy Pattern)

###### 应用场景：优惠折扣计算

核心实现：

```
IDiscountCalculateService (策略接口)
    ↓
AbstractDiscountCalculateService (抽象策略 + 模板方法)
    ↓
├── MJCalculateService (满减策略 - @Service("MJ"))
├── ZKCalculateService (折扣策略 - @Service("ZK"))
├── ZJCalculateService (直减策略 - @Service("ZJ"))
└── NCalculateService  (N元购策略 - @Service("N"))
```

好处：新增促销类型只需新建一个策略类，无需修改现有代码（开闭原则）。利用Spring的 Map自动装配。做到业务隔离，每种促销规则独立实现，互不影响

##### 二、责任链模式 (Chain of Responsibility)

###### 应用场景：营销试算流程控制

**各节点职责：**

| 节点           | 职责                    | 设计价值                     |
| -------------- | ----------------------- | ---------------------------- |
| **RootNode**   | 参数校验、流程入口      | 统一入口，防止脏数据进入     |
| **SwitchNode** | 流程开关控制            | 灵活控制流程走向，支持降级   |
| **MarketNode** | 异步加载数据 + 折扣计算 | 提升性能，并行查询活动和商品 |
| **TagNode**    | 人群标签过滤            | 精准营销，限定优惠人群       |
| **EndNode**    | 组装返回结果            | 统一出口，标准化响应         |
| **ErrorNode**  | 异常处理                | 统一异常处理，提供降级方案   |

每个节点通过 `get()`方法决定下一个节点

##### 三、工厂模式

###### 应用场景：策略工厂`DefaultActivityStrategyFactory` 实现：

```java
@Service
public class DefaultActivityStrategyFactory {
    private final RootNode rootNode;
    
    public StrategyHandler strategyHandler() {
        return rootNode; // 返回责任链的起点
    }
}
```

通过工厂获取策略处理器

##### 四、建造者模式

###### 应用场景：实体对象构建

**Entity中大量使用 `@Builder` 注解：**

```java
@Data
@Builder
public class TrialBalanceEntity {
    private String userId;
    private BigDecimal originalPrice;
    private BigDecimal deductionPrice;
    private BigDecimal payPrice;
}

// 使用
TrialBalanceEntity entity = TrialBalanceEntity.builder()
    .userId("xiaofuge")
    .originalPrice(new BigDecimal("100"))
    .deductionPrice(new BigDecimal("20"))
    .payPrice(new BigDecimal("80"))
    .build();
```



### 九、如何处理异常

![image-20251006100553400](https://raw.githubusercontent.com/zhaojianjun2004/picGo/master/img/image-20251006100553400.png)

**举个实际例子**：假设你开发一个用户注册功能。如果用户名已存在，你应该抛出一个自定义的 `UserAlreadyExistsException`。这个异常应该继承 `RuntimeException`（非检查异常），因为：

1. 用户名重复是一个业务规则验证失败，属于程序逻辑的一部分
2. controller 层可以直接捕获这个异常并返回友好的错误信息给前端
3. 不需要在 service、dao 等每一层都写 `throws UserAlreadyExistsException`

```java
// 自定义业务异常（非检查异常）
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String username) {
        super("用户名 " + username + " 已存在");
    }
}

// service 层
public void registerUser(String username) {
    if (userRepository.existsByUsername(username)) {
        throw new UserAlreadyExistsException(username); // 直接抛出，无需 throws 声明
    }
    // ... 创建用户
}

// controller 层
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    try {
        userService.registerUser(request.getUsername());
        return ResponseEntity.ok("注册成功");
    } catch (UserAlreadyExistsException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
```

### 十、哪里会打印日志

#### 系统分层架构分析：

##### 1. 应用层日志（核心）

1.1 业务方法

- 方法出入口：请求参数与返回结果
- 业务状态变更：比如订单状态变更、用户注册成功等
- 异常处理：捕获异常记录详细错误信息
- 重要决策点：If/else分支的判断结果

1.2 接口层

- 接口入口，请求成功日志
- 出口返回结果日志/异常日志

1.3 数据访问层

- 通常只记录异常日志

##### 2. 中间件层日志

2.1 Web服务器日志

- 记录http请求

2.2 应用服务器日志

- tomcat日志：启动日志、部署日志

- springboot启动日志，自动配置报告等

2.3 消息队列日志

- 消息接收成功/进入死信队列等

##### 3.基础设施层日志

3.1 系统级别日志

- docker容器日志
- 操作系统日志

3.2 数据库日志

- mysql慢查询日志
- mysql错误日志
- binlog/undo log/redo log

3.3 缓存日志

3.4 性能监控日志，第三方服务调用日志

#### 拓展

##### 日志级别

| 日志级别  | 使用场景           | 频率               |
| --------- | ------------------ | ------------------ |
| **ERROR** | 系统错误、异常     | 少量，需要立即关注 |
| **WARN**  | 业务异常、潜在问题 | 适中，需要定期检查 |
| **INFO**  | 业务流程、关键节点 | 适量，用于业务追踪 |
| **DEBUG** | 详细调试信息       | 开发/测试环境开启  |
| **TRACE** | 最详细的信息       | 很少使用           |

 注意：

- **生产环境通常开启 INFO 级别**
- **敏感信息不要记录**（密码、身份证号等）
- **使用参数化日志**，避免字符串拼接性能问题

##### 日志架构

1. **应用层**：使用 Logback/Log4j2 记录结构化日志（JSON 格式）
2. **日志收集**：Filebeat/Fluentd 收集日志
3. **日志传输**：发送到 Kafka/RabbitMQ
4. **日志存储**：Elasticsearch 存储
5. **日志查询**：Kibana/Grafana 可视化

### 十一、遇到性能瓶颈如何解决？核心代码模式

#### 缓存模式

**适用场景**：重复计算、频繁数据库查询、外部API调用

对于频繁的数据库查询，我们可以考虑使用缓存（本地缓存caffeine、分布式缓存Redis）来加快查询以及减少数据库的压力。关键点就是需要考虑缓存的三大经典问题：缓存穿透、缓存击穿、缓存雪崩，以及数据库与缓存的一致性问题

#### 异步模式

**适用场景**：非核心业务、耗时操作、解耦

可以使用线程进行异步操作，也可以使用消息队列异步。我们需要注意的是，异步处理涉及到异常捕获以及数据一致性的问题（考虑是否需要异步操作结果与主业务的最终一致性）。如果用到了线程池，我们需要注意线程池的配置：核心线程数、最大线程数、队列大小。

对于消息队列与线程池之间的选择，线程池相对使用简单，低延迟，但是可靠性较差（线程重启丢失任务）。而消息队列异步，消息可靠性相对较高，并且可以流量削峰。但是使用起来相对较复杂，毕竟引入中间件，需要依赖配置。

#### 批量处理模式

**适用场景**：循环内数据库操作、网络请求

使用批量处理的方式来解决数据库查询N+1的问题

#### 池化模式

**适用场景**：昂贵资源创建（数据库连接、HTTP连接、线程）

线程池复用、数据库连接池（HikariCP）。除了资源复用，动态调整相关参数，池化模式还有优势：可观测。可以监控相关指标，泄漏检测等。

#### 锁优化

- 锁粒度：尽量细粒度
- 读写分离：读写锁适用于读多写少
- 无锁化：CAS操作、不可变对象

### 手撕：旋转数组

![image-20251002181956065](https://raw.githubusercontent.com/zhaojianjun2004/picGo/master/img/image-20251002181956065.png)

```java
class Solution {
    public void rotate(int[] nums, int k) {
        if(nums.length<=1) return;
        k %=nums.length ;
        swap(nums,0,nums.length-1);
        swap(nums,0,k-1);
        swap(nums,k,nums.length-1);
    }
    private void swap(int[]nums,int l,int r){
        // [1,2,3,4] l=0 r=3
        while(l<r){
            int temp = nums[l];
            nums[l]=nums[r];
            nums[r]=temp;
            l++;
            r--;
        }
    }
}
```

