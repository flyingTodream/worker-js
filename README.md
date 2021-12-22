## 使用Web Worker实现更新内容通知功能

### Web Worker的优势

Web Work会为javascript创建多线程环境，不会阻塞主线程，影响页面渲染速度和页面性能。Web Work可以在不添加额外服务器的情况下实现前端更新通知的功能，使成本最小化。相比于SSE（Server-sent Events）不依赖于任何一端，前端具有完全掌控权

------

### 实现

#### 实现原理

由于环境变量在不刷新页面的情况下不会改变，而静态文件的内容可以实时获取到最新值，所以可以根据这个特性实现前端更新通知功能

#### 实现过程

在打包过程中，获取git commit 的hash值，写在public静态文件夹内和项目环境变量中， 页面主线程获取到环境变量后，开启一个worker线程监听worker消息，并把环境变量传递到worker线程。在worker线程中获取到主线程传来的commit hash后，会不停轮询获取静态文件中的commit hash，并进行对比，如果静态文件中的commit hash与环境变量中的commit hash不一致，就会发送消息给页面主线程，通知有新内容更新

#### 使用方法（jenkins）

打包过程中设置环境变量，在jenkins加入以下代码（需在打包命令前）：

[jenkins打包环境git变量参考](https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/Complete-Jenkins-Git-environment-variables-list-for-batch-jobs-and-shell-script-builds)

```bash
echo ${GIT_COMMIT} > public/version.txt
echo 'VITE_HASH='${GIT_COMMIT} > .env
```

##### 引入workerjs

```javascript
import Workerjs  from 'workerjs-web'
```

##### 创建Workjs对象接收以下参数

| 参数名      |类型| 是否必填 |默认值 | 说明  |
| :---------:  | --- | -------- | ---- | ----------------------------- |
| commitHash  |String| 是       | 无 | 项目中获取或环境变量中的commithash |
| pollingTime |Number| 否       | 15 | 轮询检查更新时间 |
| versionUrl |String| 否 | /version.txt | 默认去找域名根目录的version.txt，如果路径配置不正确，会导致查不到最新的hash值，（不加域名） |
|onUpdate |Function|否|空函数|捕捉到有新内容更新的函数，可以在里面做提示更新等操作|

e.g.

```javascript
import Workerjs  from 'workerjs-web' 
let work = new Workerjs({
   commitHash: 'xxxxxxxxxxxx', 
   pollingTime: 1, 
   versionUrl: '/version.txt',
   onUpdate: () => {}
})
work.createWorkerjs()
```

#### 暴露方法

**createWorkerjs**
创建worker线程

**close**
关闭worker线程

在vue-ts引用，编辑器可能会报错，在shims-vue.d.ts文件里添加以下代码即可

```javascript
declare module 'worker-web'
```
