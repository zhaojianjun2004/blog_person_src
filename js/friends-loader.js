// 友链数据加载器
class FriendsLoader {
    constructor() {
        this.friendsData = [];
        this.friendsContainer = document.getElementById('friendsGrid');
        this.init();
    }

    init() {
        this.loadFriendsData();
    }

    // 加载友链数据
    async loadFriendsData() {
        try {
            // 尝试从本地JSON文件加载友链数据
            const response = await fetch('/data/friends.json');
            if (response.ok) {
                this.friendsData = await response.json();
            } else {
                // 如果文件不存在，使用默认示例数据
                this.friendsData = this.getDefaultFriends();
            }
            this.renderFriends();
        } catch (error) {
            console.log('友链数据文件未找到，使用默认数据');
            this.friendsData = this.getDefaultFriends();
            this.renderFriends();
        }
    }

    // 获取默认示例友链数据
    getDefaultFriends() {
        return [
            {
                name: "张三的技术博客",
                url: "https://example1.com",
                avatar: "https://via.placeholder.com/40x40/00ffff/000000?text=ZS",
                description: "专注前端技术分享"
            },
            {
                name: "李四的编程世界",
                url: "https://example2.com", 
                avatar: "https://via.placeholder.com/40x40/0099ff/ffffff?text=LS",
                description: "后端开发经验分享"
            },
            {
                name: "王五的代码人生",
                url: "https://example3.com",
                avatar: "https://via.placeholder.com/40x40/ff6600/ffffff?text=WW",
                description: "全栈工程师的成长之路"
            }
        ];
    }

    // 渲染友链
    renderFriends() {
        if (!this.friendsContainer) {
            console.error('友链容器未找到');
            return;
        }

        if (this.friendsData.length === 0) {
            this.friendsContainer.innerHTML = `
                <div class="no-friends">
                    <p>暂无友链，欢迎交换～</p>
                </div>
            `;
            return;
        }

        const friendsHTML = this.friendsData.map(friend => {
            return `
                <a href="${friend.url}" target="_blank" rel="noopener noreferrer" class="friend-link">
                    <img src="${friend.avatar}" alt="${friend.name}" class="friend-avatar" 
                         onerror="this.src='https://via.placeholder.com/40x40/00ffff/000000?text=${friend.name.charAt(0)}'">
                    <div class="friend-info">
                        <div class="friend-name">${friend.name}</div>
                        <div class="friend-description">${friend.description}</div>
                    </div>
                </a>
            `;
        }).join('');

        this.friendsContainer.innerHTML = friendsHTML;
    }

    // 添加新友链（用于后续功能扩展）
    addFriend(friendData) {
        this.friendsData.push(friendData);
        this.renderFriends();
    }

    // 删除友链（用于后续功能扩展）
    removeFriend(friendUrl) {
        this.friendsData = this.friendsData.filter(friend => friend.url !== friendUrl);
        this.renderFriends();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/link' || window.location.pathname === '/link.html') {
        new FriendsLoader();
    }
});
