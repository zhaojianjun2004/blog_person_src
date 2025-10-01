---
title: 面试必考！Java实现归并、快排、堆排，彻底搞懂NlogN算法
date: 2025-09-04
updated: 2025-09-10
category: java
tags:
  - "java"
  - "面试题"
  - "算法"
---



如果你正在准备算法面试，那么这三种排序你一定绕不开：

> **归并排序、快速排序、堆排序** 

它们是 *O*(*n*log*n*) 时间复杂度的代表，也是各大厂面试中的“常客”。无论是手撕代码、分析稳定性，还是讨论递归优化，这些问题都可能在一轮面试中接连抛出。

别慌，今天我们就来**逐个击破**，用最直白的语言 + 清晰的 Java 实现，带你真正理解这三大经典排序的本质。

## 一、归并排序（Merge Sort）

### 1. 核心思想：分而治之

归并排序的核心思想来自``“分治法”``（Divide and Conquer）：

> **先把大问题拆成小问题，分别解决，再把结果合并起来。** 

具体到排序就是：

1. 把数组从中间一分为二；
2. 对左右两部分递归地进行归并排序；
3. 将两个有序的子数组“合并”成一个更大的有序数组。

这个过程像极了“先分家，后团圆”。

### 2. 算法步骤

1. **分解**：将数组不断二分，直到每个子数组只有一个元素（单个元素天然有序）。
2. **合并**：将两个有序数组合并为一个新的有序数组，使用双指针技巧。
3. **回溯**：层层合并，最终得到完整有序数组。

📌 关键：**合并操作是稳定的，且能高效完成。**

### 3. Java 代码实现

```java
public class MergeSort {

    public static void mergeSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        int[] temp = new int[arr.length]; // 辅助数组，避免频繁创建
        mergeSort(arr, temp, 0, arr.length - 1);
    }

    private static void mergeSort(int[] arr, int[] temp, int left, int right) {
        if (left >= right) return; // 递归终止：只有一个元素

        int mid = left + (right - left) / 2;
        mergeSort(arr, temp, left, mid);      // 排左半
        mergeSort(arr, temp, mid + 1, right); // 排右半
        merge(arr, temp, left, mid, right);   // 合并
    }

    private static void merge(int[] arr, int[] temp, int left, int mid, int right) {
        // 复制当前区间到辅助数组
        for (int i = left; i <= right; i++) {
            temp[i] = arr[i];
        }

        int i = left;      // 左半部分起点
        int j = mid + 1;   // 右半部分起点
        int k = left;      // 原数组的写入位置

        // 双指针合并
        while (i <= mid && j <= right) {
            if (temp[i] <= temp[j]) {  
                arr[k++] = temp[i++]; // 左边小，先放左边
            } else {
                arr[k++] = temp[j++]; // 右边小，先放右边
            }
        }

        // 处理剩余元素
        while (i <= mid) arr[k++] = temp[i++];
        while (j <= right) arr[k++] = temp[j++];
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("排序前: " + java.util.Arrays.toString(arr));
        mergeSort(arr);
        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

### 4.代码解析：三句话讲清楚

1. **递归拆分**：`mergeSort` 不断将数组从中点拆成左右两半，直到只剩一个元素（自然有序）。
2. **辅助数组防覆盖**：`merge` 前先复制当前段到 `temp`，防止合并时读取错误数据。
3. **双指针合并**：用 `i` 和 `j` 分别指向左右两段，谁小取谁，放入原数组；最后补上剩余部分。

📌 **关键点**：

- `temp` 数组是性能优化，避免频繁创建；
- 比较时用 `<=` 而不是 `<`，保证**稳定性**（相等时优先取左边）；
- 合并完成后，`arr[left..right]` 就有序了。

<!-----------------------------问题分析------------------------------->

#### 🤔 问题：为什么要有“处理剩余元素”这一步？

先看代码：

```java
// 处理剩余元素
while (i <= mid) arr[k++] = temp[i++];
while (j <= right) arr[k++] = temp[j++];
```

这三行代码的意思是：

> 把**左边或右边还没来得及合并的元素**，全部补到结果数组里。 

听起来简单，但为什么要这么做？我们通过一个例子来说明。

#### 🧩 举个例子：看看“剩余元素”是怎么来的

假设我们有两个已经排好序的子数组，要合并它们：

```
左半部分（left ~ mid）：[3, 7, 9]
右半部分（mid+1 ~ right）：[4, 5, 8]
```

它们在 `temp` 数组中是这样的（假设原始位置从索引 0 开始）：

```
temp: [3, 7, 9, 4, 5, 8]
       ↑     ↑  ↑
     i=0   mid=2 j=3
```

我们用双指针 `i` 和 `j` 从两个子数组开头开始比较：

| 步骤 | 比较    | 操作      | 结果数组arr   |
| ---- | ------- | --------- | ------------- |
| 1    | `3 < 4` | 取左边`3` | `[3]`         |
| 2    | `7 > 4` | 取右边`4` | `[3,4]`       |
| 3    | `7 > 5` | 取右边`5` | `[3,4,5]`     |
| 4    | `7 < 8` | 取左边`7` | `[3,4,5,7]`   |
| 5    | `9 > 8` | 取右边`8` | `[3,4,5,7,8]` |

现在：

- `i = 2`（指向 `9`）
- `j = 5`（越过了右半部分）
- `j > right` → 跳出主循环

但注意：**左边还剩一个 `9` 没放进去！**

👉 这就是“剩余元素”。

如果此时不处理，`9` 就会被丢掉，结果变成 `[3,4,5,7,8]`，明显错了。

所以我们要补上：

```java
while (i <= mid) arr[k++] = temp[i++];
```

这句就会把 `9` 补上，最终得到 `[3,4,5,7,8,9]`，正确！

#### 🎯 什么时候会出现“剩余元素”？

只要有一个子数组**先被取完**，另一个子数组剩下的元素就都是“剩余元素”。

比如：

| 情况                            | 哪边有剩余 |
| ------------------------------- | ---------- |
| 左边小，右边大 → 左边先取完     | 右边有剩余 |
| 右边小，左边大 → 右边先取完     | 左边有剩余 |
| 两边一样长，最后相等 → 同时取完 | 都没有剩余 |

✅ 所以我们必须检查两边是否还有“漏网之鱼”。

#### 🔍 为什么不能只靠主循环？

主循环的条件是：

```java
while (i <= mid && j <= right)
```

意思是：**只有当两边都还有元素时，才继续比较**。

一旦某一边走完了（比如 `j > right`），循环就结束了，不管另一边还有多少元素。

所以，主循环只负责“交叉合并”，**不负责收尾**。

> 📌 收尾工作，就是“处理剩余元素”的使命。 

#### ✅ 类比理解：两个队伍合并报数

想象你有两个排好序的队伍：

- A队：3, 7, 9
- B队：4, 5, 8

你们要合并成一个有序的大队列。

规则是：每次比较两队第一个没报数的人，谁小谁出列。

当 B 队的 `8` 出列后，B 队没人了，但 A 队还有 `9` 没报。

这时候，你不能说“B 队没了，结束！”——否则 `9` 就被遗忘了。

正确的做法是：**把 A 队剩下的所有人依次出列**。

这就是“处理剩余元素”的现实意义。

### 💡 总结：三句话搞懂“处理剩余元素”

1. **主循环只合并到某一边取完为止**，不会处理剩下的。
2. **剩下的一边一定是有序的**，而且比已合并的所有元素都大（因为前面的都比较过了）。
3. **所以可以直接依次复制过去，不需要再比较**。

### 5. 复杂度分析

| 项目           | 说明                                      |
| -------------- | ----------------------------------------- |
| **时间复杂度** | *O*(*n*log*n*)—— 无论最好、最坏、平均情况 |
| **空间复杂度** | *O*(*n*)—— 需要一个辅助数组               |
| **稳定性**     | ✅ 稳定 —— 相等时优先取左边元素            |
| **是否原地**   | ❌ 非原地排序                              |

> 💬 归并排序像是一个严谨的工程师：不追求最快，但始终可靠。 

### 6. 优缺点

- ✅ **优点**：时间稳定、可并行、适合链表、外部排序（如大文件排序）。
- ❌ **缺点**：需要额外空间，小数据场景不如插入排序快。

## 二、快速排序（Quick Sort）

### 1. 核心思想：挖坑填数 + 分区

快速排序也是分治思想的体现，但策略不同：

> **选一个基准值（pivot），把数组分成两部分：小于它的放左边，大于它的放右边。然后对左右两部分递归处理。** 

这个过程叫做“分区”（Partition），是快排的灵魂。

### 2. 算法步骤

1. 从数组中选择一个元素作为“基准”（pivot），通常选第一个或随机一个。
2. 将所有小于 pivot 的元素移到它左边，大于的移到右边。
3. 此时 pivot 的位置就确定了。
4. 对左右两个子数组递归执行快排。

📌 关键：**如何高效分区？**

### 3. Java 代码实现（挖坑法 + 双指针）

```java
public class QuickSort {

    /**
     * 快速排序主方法（入口）
     * 调用递归版本，传入初始边界
     * @param arr 待排序的整数数组
     */
    public static void quickSort(int[] arr) {
        // 边界检查：空数组或只有一个元素时，无需排序
        if (arr == null || arr.length <= 1) {
            return;
        }
        // 启动递归快排，处理整个数组范围 [0, length-1]
        quickSort(arr, 0, arr.length - 1);
    }

    /**
     * 递归快排函数
     * 将数组分为左右两部分，分别进行快排
     * @param arr 数组
     * @param left 当前处理区间的左边界
     * @param right 当前处理区间的右边界
     */
    private static void quickSort(int[] arr, int left, int right) {
        // 递归终止条件：如果左边界 >= 右边界，说明当前区间元素个数 ≤1，已有序
        if (left >= right) {
            return;
        }

        // 使用 partition 函数对当前区间 [left, right] 进行分区操作
        // 返回基准元素（pivot）最终应该在的位置索引
        int pivotIndex = partition(arr, left, right);

        // 递归排序基准左侧的子数组 [left, pivotIndex - 1]
        quickSort(arr, left, pivotIndex - 1);

        // 递归排序基准右侧的子数组 [pivotIndex + 1, right]
        quickSort(arr, pivotIndex + 1, right);
    }

    /**
     * 分区函数（挖坑法实现）
     * 将区间 [left, right] 中的元素重新排列，使得：
     * - 所有小于 pivot 的元素放在其左边
     * - 所有大于等于 pivot 的元素放在其右边
     * 最终返回 pivot 的最终位置
     *
     * 使用“挖坑填数”技巧，避免频繁交换
     */
    private static int partition(int[] arr, int left, int right) {
        // 选择最左边的元素作为基准值（pivot）
        int pivot = arr[left];

        // 定义两个指针，从区间两端向中间扫描
        int i = left;   // 左指针，从左边开始
        int j = right;  // 右指针，从右边开始

        // 当两个指针未相遇时，持续进行分区操作
        while (i < j) {

            /*
             * 第一步：从右往左找
             * 找到第一个小于 pivot 的元素
             * 注意：arr[j] >= pivot 时继续移动，跳过所有“大或等于”的数
             */
            while (i < j && arr[j] >= pivot) {
                j--;  // 右指针左移
            }
            // 如果找到了这样的元素（i < j 成立），把它填到左边的“坑”里
            if (i < j) {
                arr[i] = arr[j];  // 把 arr[j] 填到 arr[i] 的位置（i 处形成新坑）
                i++;              // 左指针右移，指向新的“坑”位置
            }

            /*
             * 第二步：从左往右找
             * 找到第一个大于或等于 pivot 的元素
             * 注意：这里用 arr[i] < pivot，跳过所有“小”的数
             */
            while (i < j && arr[i] < pivot) {
                i++;  // 左指针右移
            }
            // 如果找到了这样的元素（i < j 成立），把它填到右边的“坑”里
            if (i < j) {
                arr[j] = arr[i];  // 把 arr[i] 填到 arr[j] 的位置（j 处形成新坑）
                j--;              // 右指针左移，指向新的“坑”位置
            }
        }

        /*
         * 循环结束时，i == j，说明指针相遇，此处就是 pivot 的最终位置
         * 将最初的 pivot 值填入这个“坑”中
         */
        arr[i] = pivot;

        // 返回 pivot 的最终索引位置，用于划分左右子区间
        return i;
    }

    /**
     * 测试方法
     * 验证快速排序的正确性
     */
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};

        System.out.println("排序前: " + java.util.Arrays.toString(arr));

        quickSort(arr);

        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

### 4. 代码解析：什么是“挖坑法”？

想象你在地上挖了个坑（`arr[left]` 被拿走），现在要找人来填。

- 从右边找一个小于 `pivot` 的数，把它挪到左边的坑里，右边就空出一个新坑；
- 再从左边找一个大于等于 `pivot` 的数，填到右边的坑；
- 如此往复，直到左右指针相遇；
- 最后把 `pivot` 填进最后的坑。

📌 这样做的好处是：**避免频繁交换，提升性能**。

### 5. 复杂度分析

| 项目           | 说明                                              |
| -------------- | ------------------------------------------------- |
| **时间复杂度** | 平均*O*(*n*log*n*)，最坏*O*(*n*2)（基准选得极差） |
| **空间复杂度** | *O*(log*n*)—— 递归栈深度                          |
| **稳定性**     | ❌ 不稳定 —— 相等元素可能被换位置                  |
| **是否原地**   | ✅ 原地排序                                        |

> ⚠️ 最坏情况出现在：数组已有序，而你每次都选第一个元素作 pivot。 

✅ 优化建议：**随机选择 pivot** 或 **三数取中法** 可避免最坏情况。

### 6. 优缺点

- ✅ **优点**：平均性能极佳，原地排序，缓存友好，Java 中 `Arrays.sort()` 对基本类型就用它。
- ❌ **缺点**：不稳定，最坏情况差，递归可能栈溢出。

> 💬 快排像一位“赌徒”：大多数时候赢麻了，但偶尔也会翻车。 

---

### 🔧 （进阶）优化实现：随机 pivot 与三数取中法

#### ✅ 优化版本 1：随机基准（Randomized Pivot）

##### 🌟 优化思路：

不固定选择 `arr[left]` 作为基准，而是**从 `left` 到 `right` 范围内随机选一个元素作为 pivot**，并把它交换到左边，再进行分区。

这样可以极大降低“每次都选到最大/最小值”的概率，使平均性能更稳定。

```java
import java.util.Random;

public class QuickSortRandom {

    private static Random rand = new Random();

    public static void quickSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        quickSort(arr, 0, arr.length - 1);
    }

    private static void quickSort(int[] arr, int left, int right) {
        if (left >= right) return;

        int pivotIndex = partitionWithRandomPivot(arr, left, right);
        quickSort(arr, left, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, right);
    }

    // 随机化分区：先随机选 pivot，再交换到左边
    private static int partitionWithRandomPivot(int[] arr, int left, int right) {
        // 随机选择一个索引
        int randomIndex = left + rand.nextInt(right - left + 1);
        // 将随机选中的元素与 left 位置交换
        swap(arr, left, randomIndex);

        int pivot = arr[left]; // 现在 pivot 是随机选的
        int i = left, j = right;

        while (i < j) {
            while (i < j && arr[j] >= pivot) j--;
            if (i < j) arr[i++] = arr[j];

            while (i < j && arr[i] < pivot) i++;
            if (i < j) arr[j--] = arr[i];
        }

        arr[i] = pivot;
        return i;
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("排序前: " + java.util.Arrays.toString(arr));
        quickSort(arr);
        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

##### ✅ 优点：

- 简单有效，适用于大多数场景；
- 在面对**已排序或近似有序数据**时，性能远优于固定 pivot。

#### ✅ 优化版本 2：三数取中法（Median-of-Three）

##### 🌟 优化思路：

从数组的**首、中、尾**三个元素中选出“中位数”作为 pivot，避免极端值。

例如：取 `arr[left]`、`arr[mid]`、`arr[right]` 中的中位数，把它交换到 `left` 位置，再进行分区。

```java
public class QuickSortMedianOfThree {

    public static void quickSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;
        quickSort(arr, 0, arr.length - 1);
    }

    private static void quickSort(int[] arr, int left, int right) {
        if (left >= right) return;

        int pivotIndex = partitionWithMedianOfThree(arr, left, right);
        quickSort(arr, left, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, right);
    }

    // 三数取中法 + 分区
    private static int partitionWithMedianOfThree(int[] arr, int left, int right) {
        medianOfThree(arr, left, right);

        int pivot = arr[left]; // 中位数已交换到 left
        int i = left, j = right;

        while (i < j) {
            while (i < j && arr[j] >= pivot) j--;
            if (i < j) arr[i++] = arr[j];

            while (i < j && arr[i] < pivot) i++;
            if (i < j) arr[j--] = arr[i];
        }

        arr[i] = pivot;
        return i;
    }

    // 将首、中、尾三数的中位数交换到 left 位置
    private static void medianOfThree(int[] arr, int left, int right) {
        int mid = left + (right - left) / 2;

        // 确保 arr[left] 是 arr[left], arr[mid], arr[right] 的中位数
        if ((arr[mid] < arr[left] && arr[left] < arr[right]) ||
            (arr[right] < arr[left] && arr[left] < arr[mid])) {
            // left 已经是中位数，无需操作
            return;
        }

        if ((arr[left] < arr[mid] && arr[mid] < arr[right]) ||
            (arr[right] < arr[mid] && arr[mid] < arr[left])) {
            // mid 是中位数，交换到 left
            swap(arr, left, mid);
        } else if ((arr[left] < arr[right] && arr[right] < arr[mid]) ||
                   (arr[mid] < arr[right] && arr[right] < arr[left])) {
            // right 是中位数，交换到 left
            swap(arr, left, right);
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
        quickSort(arr);
        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

##### ✅ 优点：

- 比随机法更“确定”，不需要随机数生成；
- 在实际库函数中广泛应用（如 Java 的 `Arrays.sort()` 对对象数组使用类似策略）。

#### 🔍 两种优化对比

| 优化方式       | 优点                 | 缺点                       | 适用场景                 |
| -------------- | -------------------- | -------------------------- | ------------------------ |
| **随机 pivot** | 实现简单，概率上最优 | 依赖随机数，可能有轻微开销 | 通用场景，教学演示       |
| **三数取中**   | 确定性强，性能稳定   | 代码稍复杂                 | 工业级实现、性能敏感场景 |

#### 💡 小贴士：生产环境中的快排

在真实的排序库中（如 Java 的 `DualPivotQuicksort`），快排通常会结合多种优化：

- 三数取中或双基准；
- 小数组切换为插入排序；
- 尾递归优化减少栈深度；
- 三路快排处理重复元素。

但对我们学习者来说，掌握 **随机化** 或 **三数取中**，就已经能显著提升快排的鲁棒性。

---

## 三、堆排序（Heap Sort）

### 1. 核心思想：利用大顶堆“逐个选最大”

堆排序基于**二叉堆**（通常是大顶堆）的性质：

> **父节点 >= 子节点**，根节点就是最大值。 

它的思路很直接：

1. 把数组构建成一个大顶堆；
2. 每次把堆顶（最大值）和末尾元素交换；
3. 堆大小减一，然后调整堆，恢复大顶堆性质；
4. 重复直到堆为空。

📌 本质：**不断“选最大”并放到末尾**，类似选择排序，但用堆加速了查找最大值的过程。

### 2. 算法步骤

1. 构建初始大顶堆（从最后一个非叶子节点开始下沉）。
2. 将堆顶与末尾交换，最大值归位。
3. 堆长度减 1，调整堆。
4. 重复步骤 2–3，直到只剩一个元素。

#### 图解算法

@JavaGuide

![heap_sort](https://raw.githubusercontent.com/zhaojianjun2004/picGo/master/img/heap_sort.gif)

### 3. Java 代码实现

```java
public class HeapSort {
    public static void heapSort(int[] arr) {
        if (arr == null || arr.length <= 1) return;

        int n = arr.length;

        // 1. 构建大顶堆（从最后一个非叶子节点开始）
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }
        // 2. 逐个取出堆顶元素
        for (int i = n - 1; i > 0; i--) {
            swap(arr, 0, i);       // 最大值放到末尾
            heapify(arr, i, 0);    // 重新调整堆（大小为 i）
        }
    }

    // 调整堆，使以 i 为根的子树满足大顶堆性质
    private static void heapify(int[] arr, int heapSize, int i) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < heapSize && arr[left] > arr[largest]) {
            largest = left;
        }
        if (right < heapSize && arr[right] > arr[largest]) {
            largest = right;
        }

        if (largest != i) {
            swap(arr, i, largest);
            heapify(arr, heapSize, largest); // 递归调整被换下去的节点
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
        heapSort(arr);
        System.out.println("排序后: " + java.util.Arrays.toString(arr));
    }
}
```

### 4. 代码解析：`heapify` 是关键

- `heapify(arr, heapSize, i)`：确保以 `i` 为根的子树是大顶堆。
- 从 `n/2 - 1` 开始构建堆，因为这是最后一个非叶子节点（数学性质）。
- 每次交换堆顶后，只对剩余部分调用 `heapify`，堆大小递减。

📌 堆用数组表示，父子关系如下：

- 父节点 `i` 的左孩子：`2*i + 1`
- 右孩子：`2*i + 2`
- 父节点：`(i-1)/2`

### 5. 复杂度分析

| 项目           | 说明                                                 |
| -------------- | ---------------------------------------------------- |
| **时间复杂度** | *O*(*n*log*n*)—— 构建堆*O*(*n*)，每次调整*O*(log*n*) |
| **空间复杂度** | *O*(1)—— 原地排序                                    |
| **稳定性**     | ❌ 不稳定 —— 跨层级交换可能打乱顺序                   |
| **是否原地**   | ✅ 原地排序                                           |

> 💬 堆排序像一位“纪律严明的士兵”：不声不响，但始终稳定输出。 

### 6. 优缺点

- ✅ **优点**：时间稳定、原地排序、适合实时系统（如嵌入式）。
- ❌ **缺点**：实现稍复杂，不稳定，缓存性能不如快排。

【如果到这还没有看懂，请移步{% post_link 彻底搞懂堆排序：从二叉堆到数组实现，一文看懂每一步  "彻底搞懂堆排序：从二叉堆到数组实现，一文看懂每一步" %}】

## 四、三大排序对比总结

| 算法     | 时间复杂度（平均） | 最坏情况       | 空间        | 稳定性 | 是否原地 | 适用场景                      |
| -------- | ------------------ | -------------- | ----------- | ------ | -------- | ----------------------------- |
| 归并排序 | *O*(*n*log*n*)     | *O*(*n*log*n*) | *O*(*n*)    | ✅      | ❌        | 外部排序、链表、要求稳定      |
| 快速排序 | *O*(*n*log*n*)     | *O*(*n*2)      | *O*(log*n*) | ❌      | ✅        | 一般数组排序（Java 基本类型） |
| 堆排序   | *O*(*n*log*n*)     | *O*(*n*log*n*) | *O*(1)      | ❌      | ✅        | 内存受限、实时系统            |

## ✅ 面试高频问题（提前准备）

1. **快排为什么快？最坏情况怎么优化？**
   → 因为分区后问题规模指数级缩小；可通过随机 pivot 或三数取中优化。
2. **归并排序为什么稳定？**
   → 合并时相等元素优先取左边。
3. **堆排序是怎么用数组实现堆的？**
   → 利用完全二叉树的索引规律：左孩子 `2i+1`，右孩子 `2i+2`。
4. **哪种排序适合链表？**
   → 归并排序（不需要随机访问，适合链表分治）。
5. **哪种排序是原地的？**
   → 快排、堆排序是原地的；归并非原地。

## 结语：NlogN 的世界，不止是排序

归并、快排、堆排，不只是三种算法，更是三种思维方式：

- **归并**：稳扎稳打，合二为一；
- **快排**：大胆分区，快速收敛；
- **堆排**：结构驱动，步步为营。

它们各有优劣，没有绝对的“最好”，只有“最合适”。