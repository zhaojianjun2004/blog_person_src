### 本地测试
命令：`node server.js`

### 云部署方式
#### 作者使用环境：aliyun centos7
##### 1. 服务器初始化
1. 更新系统软件包
```shell
yum update -y
```
2. 安装必要工具
```shell
yum install -y git
yum install -y nodejs
yum install -y nginx
```
3. 配置防火墙
```shell
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```
> 注意：这个地方就可以开启你的端口了
> 比如8081:
```shell
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload
```
##### 2. 部署博客
1. 克隆链接：
```shell
git clone https://github.com/zhaojianjun2004/blog_person_src.git blog_person
cd blog_person
```
2. 安装项目依赖
```shell
npm install
```
> 这里如果没有npm，执行以下代码：
> 1.先检查是否nodejs下载完整
> `node -v`
> 前面没问题就执行：
> `yum install -y npm`
> 验证方式：`npm -v`
3. 启动nodejs服务
- 使用pm2管理
```shell
npm install -g pm2
pm2 start server.js --name blog_person
pm2 startup
pm2 save
```
##### 3. 配置反向代理
1. 编辑文件
```shell
sudo vi /etc/nginx/conf.d/blog_person.conf
```
添加以下内容：
```
server {
    listen 80; // 建议改一个，比如8081，对应前面我们开启的端口
    server_name <你的域名或服务器IP>;

    location / {
        proxy_pass http://127.0.0.1:3001; // 这里是因为我的代码里面配置的3001 
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
2. 启动并测试nginx
```shell
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

##### 4. 维护和更新
拉取最新代码并更新
```shell
git pull origin main
pm2 restart blog_person
```
