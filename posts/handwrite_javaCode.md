---
title: Java面试手写代码实战：从单例模式到线程交替打印
comments: true
author: caicaixiong
layout: post
date: 2025-09-23
updated: "2025-10-01"
category: "programming"
toc: true
toc_number: false
tags:
  - "java"
  - "并发编程"
  - "设计模式"
---

## 单例模式

单例的核心目标是：确保一个类在整个应用中只有一个实例，并提供一个全局访问点。虽然概念简单，但不同场景下的实现方式差异很大，面试官往往通过这个问题考察你对线程安全、性能和类加载机制的掌握。

最基础的实现是**饿汉式**，在类加载时就创建实例，天然线程安全：

```java
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {}

    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

这种方式简单可靠，但缺点是无论是否使用都会创建对象，可能造成资源浪费。于是引出了**懒汉式**——延迟加载：

```java
public class Singleton {
    private static Singleton instance;

    private Singleton() {}

    public static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

这里通过`synchronized`保证线程安全，但每次调用`getInstance()`都要加锁，性能较差。为了优化，我们引入**双重检查锁定（Double-Checked Locking）**：

```java
public class Singleton {
    private static volatile Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

注意这里的`volatile`关键字至关重要，它防止了指令重排序，确保多线程环境下实例的正确发布。这是目前推荐的懒加载线程安全实现。

还有一种优雅的方式是**静态内部类**：

```java
public class Singleton {
    private Singleton() {}

    private static class Holder {
        private static final Singleton INSTANCE = new Singleton();
    }

    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}
```

利用类加载机制保证线程安全，同时实现懒加载，代码简洁且高效，是实际开发中的优选方案。

---

## 交替打印ABC

这类题目的核心在于线程间的协调与通信，常用于考察对`wait()`、`notify()`、`Lock`、`Condition`或`Semaphore`等并发工具的理解。

我们以使用`wait/notify`为例，实现三个线程轮流打印A、B、C各10次：

```java
public class PrintABC {
    private int flag = 1; // 1:A, 2:B, 3:C
    private final Object lock = new Object();

    public static void main(String[] args) {
        PrintABC printer = new PrintABC();

        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                printer.printA();
            }
        }, "Thread-A");

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                printer.printB();
            }
        }, "Thread-B");

        Thread t3 = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                printer.printC();
            }
        }, "Thread-C");

        t1.start();
        t2.start();
        t3.start();
    }

    public void printA() {
        synchronized (lock) {
            while (flag != 1) {
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            System.out.print("A");
            flag = 2;
            lock.notifyAll();
        }
    }

    public void printB() {
        synchronized (lock) {
            while (flag != 2) {
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            System.out.print("B");
            flag = 3;
            lock.notifyAll();
        }
    }

    public void printC() {
        synchronized (lock) {
            while (flag != 3) {
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            System.out.print("C");
            flag = 1;
            lock.notifyAll();
        }
    }
}
```

输出结果将是：`ABCABCABC...`，共10组。关键点在于使用一个共享变量`flag`控制执行顺序，每个线程在不符合条件时`wait()`，符合条件时打印并更新`flag`，然后唤醒其他线程。注意必须使用`while`判断而非`if`，防止虚假唤醒。