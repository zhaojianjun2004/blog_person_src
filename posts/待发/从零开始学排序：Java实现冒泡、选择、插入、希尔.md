---
title: 从零开始学排序：Java实现冒泡、选择、插入、希尔
date: 2025-09-03
updated: 2025-09-03
category: programming
tags:
  - "java"
  - "面试题"
  - "算法"
---

排序是算法世界的“入门第一课”。在学习复杂算法之前，理解几种基础排序的思想，不仅能打下扎实的功底，还能帮助我们建立对时间、空间复杂度的直观认知。

本文将带你系统梳理四种经典排序算法：**冒泡排序、选择排序、插入排序和希尔排序**。每一种都配有清晰的核心思想、步骤解析、Java 实现以及复杂度分析。不堆术语，只讲人话，力求让你看完就能懂、能写、能讲。

---

## 一、冒泡排序（Bubble Sort）

### 1. 核心思想

冒泡排序的名字很形象——就像水中的气泡一样，**小的元素慢慢“浮”向顶端，大的元素逐渐“沉”到底部**。

它的基本逻辑很简单：

> 重复遍历数组，比较相邻两个元素，如果顺序错了（前 > 后），就交换它们。每一轮下来，最大的那个数就会被“推”到最后的位置。

这个过程不断重复，直到整个数组有序为止。

---

### 2. 算法步骤

1. 从数组第一个元素开始，依次比较相邻两数。
2. 若前面的数比后面的大，则交换位置。
3. 一趟扫描完成后，最大值已“冒泡”到末尾。
4. 对剩下的未排序部分重复上述过程，直到所有元素归位。

> 📌 小贴士：每完成一轮，最后的 `i` 个元素已经是最大且有序的，所以下一轮可以少比较 `i` 次。

---

### 3. Java 代码实现
```java
public class BubbleSort {
    /**
     * 冒泡排序 - 基础版本
     * @param arr 待排序的整数数组
     */
    public static void bubbleSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    swap(arr, j, j + 1);
                }
            }
        }
    }
    
    /**
     * 冒泡排序 - 优化版本（提前终止）
     * 如果某轮没有发生交换，说明已经有序，无需继续
     */
    public static void bubbleSortOptimized(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    swap(arr, j, j + 1);
                    swapped = true;
                }
            }
            if (!swapped) break; // 没有交换 → 已有序
        }
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("排序前: " + java.util.Arrays.toString(arr));
        bubbleSortOptimized(arr);
        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

### 4. 复杂度分析

| 项目           | 说明                                        |
| -------------- | ------------------------------------------- |
| **时间复杂度** | 最坏 O(n²)，最好 O(n)（优化版），平均 O(n²) |
| **空间复杂度** | O(1) —— 原地排序                            |
| **稳定性**     | ✅ 稳定 —— 相等元素不会因交换改变相对位置    |

> ⚠️ 注意：只有**优化版本**能在数组已有序时达到 O(n) 时间。基础版即使数据已经排好，仍会执行全部 n-1 轮。

---

### 5. 优缺点

- ✅ **优点**：逻辑清晰，代码易懂，稳定。
- ❌ **缺点**：效率低，不适合大规模数据。

> 💬 小感悟：冒泡排序像是一个认真但效率不高的学生——每一步都踏踏实实，但从不懂“变通”。

---

## 二、选择排序（Selection Sort）

### 1. 核心思想

选择排序的思路非常直接：

> 每次都在未排序的部分中找出最小（或最大）的元素，把它放到已排序部分的末尾。

你可以把它想象成“选秀”：每一回合选出当前最优秀的选手，安排进榜单。

---

### 2. 算法步骤

1. 在未排序区间中找到最小元素的下标。
2. 将其与未排序区间的第一个元素交换。
3. 已排序区间的边界右移一位。
4. 重复以上过程，直到全部排完。

> 🎯 每轮只进行一次交换，无论数组是否有序。

---

### 3. Java 代码实现
```java
public class SelectionSort {
    public static void selectionSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            if (minIndex != i) {
                swap(arr, i, minIndex);
            }
        }
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("排序前: " + java.util.Arrays.toString(arr));
        selectionSort(arr);
        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

### 4. 复杂度分析

| 项目           | 说明                                                         |
| -------------- | ------------------------------------------------------------ |
| **时间复杂度** | O(n²) —— 不论好坏，都要找 n 次最小值                         |
| **空间复杂度** | O(1)                                                         |
| **稳定性**     | ❌ 不稳定 —— 举例：`[5, 2, 3, 5, 1]`中第一个`5`可能被换到后面 |

---

### 5. 优缺点

- ✅ **优点**：交换次数少（最多 n-1 次），适合写入成本高的场景（如闪存）。
- ❌ **缺点**：无法利用已有有序性，效率固定偏低，且不稳定。

> 💬 类比：选择排序像是一位“铁面无私”的裁判，不管数据原本如何，都坚持走完流程。

---

## 三、插入排序（Insertion Sort）

### 1. 核心思想

插入排序的灵感来自我们打扑克时整理手牌的方式：

> 每拿到一张新牌，就把它插入到手中已排好序的牌中的正确位置。

它维护一个“已排序”的前缀区域，每次将下一个元素“插入”其中，保持整体有序。

---

### 2. 算法步骤

1. 第一个元素默认已排序。
2. 取出第二个元素作为 `key`。
3. 从已排序部分的末尾开始往前找，把所有大于 `key` 的元素后移一位。
4. 找到合适位置后，插入 `key`。
5. 继续处理后续元素，直到结束。

> 🔁 关键在于“边找边移”，腾出空位再插入。

---

### 3. Java 代码实现
```java
public class InsertionSort {
    public static void insertionSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("排序前: " + java.util.Arrays.toString(arr));
        insertionSort(arr);
        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

### 4. 复杂度分析

| 项目           | 说明                                        |
| -------------- | ------------------------------------------- |
| **时间复杂度** | 最坏 O(n²)，最好 O(n)（已有序），平均 O(n²) |
| **空间复杂度** | O(1)                                        |
| **稳定性**     | ✅ 稳定 —— 相等时不触发移动，原顺序保留      |

---

### 5. 优缺点

- ✅ **优点**：对小规模或近乎有序的数据极快；稳定；实现简单。
- ❌ **缺点**：数据量大或完全无序时性能急剧下降。

> 💬 插入排序是“聪明的懒人”——如果数据本来就很整齐，它能迅速收工。

---

## 四、希尔排序（Shell Sort）

### 1. 核心思想

希尔排序是插入排序的“升级版”，由 Donald Shell 提出。它解决了插入排序只能“一步步挪”的问题。

核心思想是：

> **先进行宏观调控，再做精细调整**。通过设定一个“增量”（gap），把数组分成多个子序列，分别进行插入排序。随着增量不断缩小，数组越来越有序，最后当 gap=1 时，整体插入排序变得非常高效。

---

### 2. 算法步骤

1. 设定初始增量（如 `n/2`）。
2. 按照该增量将数组划分为若干子序列（即每隔 gap 个元素取一个）。
3. 对每个子序列独立执行插入排序。
4. 缩小增量（如 `gap /= 2`），重复步骤 2–3。
5. 当 `gap == 1` 时，对整个数组做最后一次插入排序。

> 🔄 增量序列常见有：`n/2, n/4, ..., 1` 或 Knuth 序列（`1, 4, 13, ...`）

---

### 3. Java 代码实现
```java
public class ShellSort {
    public static void shellSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        
        for (int gap = arr.length / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < arr.length; i++) {
                int temp = arr[i];
                int j = i;
                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                arr[j] = temp;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("排序前: " + java.util.Arrays.toString(arr));
        shellSort(arr);
        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

### 4. 复杂度分析

| 项目           | 说明                                                         |
| -------------- | ------------------------------------------------------------ |
| **时间复杂度** | 依赖增量序列。常用`n/2`序列为 O(n²)，Knuth 可达 O(n^1.5) 左右 |
| **空间复杂度** | O(1)                                                         |
| **稳定性**     | ❌ 不稳定 —— 跨距离交换可能打乱相等元素顺序                   |

---

### 5. 优缺点

- ✅ **优点**：比插入排序快得多，尤其适合中等规模数据；代码简洁。
- ❌ **缺点**：性能受增量选择影响大；不稳定；理论分析较复杂。

> 💬 希尔排序像是“先粗调再微调”的调音师——一开始大刀阔斧，后期精准入微。

【到这还不懂希尔排序的话，可以{% post_link 希尔排序详解 "点击进入希尔排序详解" %}】

---

## 结语：排序的起点，不是终点

今天我们系统学习了四种基础排序算法：

| 算法     | 是否稳定 | 最佳时间     | 使用场景      |
| -------- | -------- | ------------ | ------------- |
| 冒泡排序 | ✅        | O(n)         | 教学演示      |
| 选择排序 | ❌        | O(n²)        | 交换代价高    |
| 插入排序 | ✅        | O(n)         | 小数据/近有序 |
| 希尔排序 | ❌        | O(n^1.3~1.5) | 中等数据优化  |


虽然它们大多不适合处理百万级数据，但在实际工程中仍有价值。比如：

- Java 的 `Arrays.sort()` 对小数组使用插入排序；
- 快速排序递归到小片段时，常切换为插入排序提升性能；
- 希尔排序在嵌入式系统或资源受限环境中依然可用。

