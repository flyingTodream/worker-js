const workjsTemplate =
    "let commitHash, pollingTime, versionUrl                         \n" +
    "function checkUpdate() { \n" +
    "    fetch(versionUrl + '?time=' + new Date().getTime(), { \n" +
    "        method: 'GET', \n" +
    "    }) \n" +
    "        .then((response) => response.text()) \n" +
    "        .then((result) => {\n" +
    "            if (commitHash.trim() !== result.trim()) {\n" +
    "                postMessage({\n" +
    "                    type: 'UPDATE',\n" +
    "                })\n" +
    "            }\n" +
    "        })\n" +
    "        .catch((error) => console.log('error', error))\n" +
    "}\n" +
    "\n" +
    "// 监听消息\n" +
    "onmessage = function (e) {\n" +
    "    if (e.data.type === 'VERSION' && e.data.hash) {\n" +
    "        pollingTime = e.data.pollingTime\n" +
    "        commitHash = e.data.hash\n" +
    "        versionUrl = e.data.versionUrl\n" +
    "        setInterval(() => {\n" +
    "            checkUpdate()\n" +
    "        }, pollingTime * 1000)\n" +
    "    }\n" +
    "}\n"

export default workjsTemplate