---
slug: tmux
title: tmux简单使用
authors: C0rr3ct
---

## 配置文件

在家目录创键`.tmux.conf`

```
set-option -g default-shell /bin/zsh

# 使用Ctrl+x作为前缀组合键
set -g prefix C-x
unbind C-b
bind C-x send-prefix

# 支持鼠标操作
setw -g mouse on
set-option -g status-right ""
```

## 会话(session)管理

### 查看会话

```
tmux ls
```

### 连接到最近的会话

```
tmux attach
tmux a
```

### 杀死所有会话

```
tmux kill-server
```

### 杀死某个会话

```
tmux kill-session -t <session-name>
```

### 切换会话

| **快捷键** |         命令          |     说明     |
| :--------: | :-------------------: | :----------: |
|  前缀 + s  | `tmux choose-session` | 查看会话列表 |

## 窗格(pane)管理

| **快捷键** |            命令            |             说明             |
| :--------: | :------------------------: | :--------------------------: |
|  前缀 + %  |   `tmux split-window -h`   |           水平分割           |
| 前缀 + ""  |   `tmux split-window -v`   |           垂直分割           |
|  前缀 + x  | `tmux kill-pane` 或 `exit` |         关闭当前窗格         |
|  前缀 + z  |   `tmux resize-pane -Z`    | 将当前窗格全屏，再次按下恢复 |

## 窗口(window)管理

| **快捷键** |         命令         |                说明                |
| :--------: | :------------------: | :--------------------------------: |
|  前缀 + w  | `tmux choose-window` | 弹出窗口列表，可以选择要切换的窗口 |