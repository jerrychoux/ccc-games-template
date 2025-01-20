import {
  _decorator,
  Component,
  Node,
  ScrollView,
  UITransform,
  Prefab,
  instantiate,
  Vec3,
} from "cc";
import { InfiniteListItem } from "./InfiniteListItem";
const { ccclass, property } = _decorator;

@ccclass("InfiniteListView")
export class InfiniteListView extends Component {
  @property(ScrollView)
  scrollView!: ScrollView;

  @property(Node)
  content!: Node;

  @property(Prefab)
  itemPrefab!: Prefab;

  @property
  itemHeight: number = 100; // 每个子项的高度

  @property
  totalItems: number = 100; // 总的子项数量

  private itemPool: Node[] = []; // 用于缓存子项
  private visibleItems: Node[] = []; // 当前显示的子项

  start() {
    // 初始化ScrollView的滚动监听
    this.scrollView.node.on("scrolling", this.onScrolling, this);

    // 创建并初始化所有子项
    for (let i = 0; i < this.totalItems; i++) {
      const item = instantiate(this.itemPrefab);
      item.active = false; // 初始时隐藏子项
      this.itemPool.push(item);
    }

    // 初始加载一些子项
    this.loadItems();
  }

  onScrolling() {
    const scrollView = this.scrollView;
    const content = this.content;
    const scrollOffset = scrollView.getScrollOffset();
    const contentHeight = content.getComponent(UITransform)!.height;

    // 检查是否需要更新子项位置
    this.updateItems(scrollOffset.y, contentHeight);
  }

  updateItems(scrollOffset: number, contentHeight: number) {
    // 获取ScrollView当前可见区域的高度
    const visibleHeight = contentHeight;

    // 计算当前显示区域顶部和底部的索引
    const startIdx = Math.floor(scrollOffset / this.itemHeight);
    const endIdx = Math.min(
      Math.ceil((scrollOffset + visibleHeight) / this.itemHeight),
      this.totalItems - 1
    );

    // 更新所有显示的子项
    for (let i = startIdx; i <= endIdx; i++) {
      if (!this.visibleItems[i]) {
        // 从池中取出一个子项
        const item = this.getItemFromPool();
        item.active = true;
        item.setPosition(new Vec3(0, -i * this.itemHeight)); // 设置位置
        this.content.addChild(item); // 添加到内容节点
        this.visibleItems[i] = item;

        // 更新子项数据
        const itemComponent = item.getComponent(InfiniteListItem);
        if (itemComponent) {
          itemComponent.updateData(i); // 更新数据
        }
      }
    }

    // 隐藏超出显示区域的子项
    for (let i = 0; i < this.visibleItems.length; i++) {
      const item = this.visibleItems[i];
      if (item && (i < startIdx || i > endIdx)) {
        item.active = false;
        this.visibleItems[i] = null!;
      }
    }
  }

  // 从池中获取一个可用的子项
  getItemFromPool(): Node {
    if (this.itemPool.length > 0) {
      return this.itemPool.pop()!;
    } else {
      return instantiate(this.itemPrefab);
    }
  }

  // 加载初始子项
  loadItems() {
    for (let i = 0; i < 10; i++) {
      // 初始加载10个子项
      const item = this.getItemFromPool();
      item.active = true;
      item.setPosition(new Vec3(0, -i * this.itemHeight));
      this.content.addChild(item);
      this.visibleItems.push(item);

      // 更新子项数据
      const itemComponent = item.getComponent(InfiniteListItem);
      if (itemComponent) {
        itemComponent.updateData(i); // 更新数据
      }
    }
  }
}
