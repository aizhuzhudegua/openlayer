<template>
    <div id="wrapper" v-if="islogin">



        <div class="container">
            <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                    <template #title>
                        <p class="title">聊天室</p>
                    </template>
                    <el-scrollbar max-height="400px">
                        <p class="empty" v-if="messages.length === 0">empty</p>
                        <div class="msg" v-for="(item, index) in messages" :key="index">
                            <div class="msg_container">
                                <div class="user">
                                    <el-avatar shape="square" :size="30"> {{ item.ID }} </el-avatar>

                                </div>
                                <div :class="'content_default ' + (item.ID === username ? 'content_active' : '')">
                                    {{ item.data }}
                                </div>
                            </div>
                        </div>
                    </el-scrollbar>
                </el-collapse-item>
            </el-collapse>


            <div class="bottom">
                <el-input v-model="message" placeholder="Please input" class="input-with-select"
                    @keyup.enter="sendMessage" @paste="handlePaste">
                    <template #append>
                        <el-button type="primary" @click="sendMessage"
                            :disabled="message.trim().length === 0">发送</el-button>
                    </template>
                </el-input>
                <div v-if="pastedImages && pastedImages.length > 0" class="image-container">
                    <div v-for="image in pastedImages" :key="image" class="image-preview">
                        <div class="img_wrap">
                            <img :src="image" alt="Pasted Image">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { socket } from '../assets/socket';
import { ref, onMounted, defineProps, watch } from 'vue';
const islogin = ref(false);
const activeNames = ref();
const message = ref('');
const messages = ref([]);
const username = localStorage.getItem('username');

const props = defineProps({
    pastedImages: {
        type:[]
    },
}) 

const pastedImages = props.pastedImages;

watch(pastedImages, (newVal, oldVal) => {
    console.log('pastedImages changed:', newVal);
    // 执行相应的处理逻辑，如更新UI或发送数据等
});
const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (e) => {
                pastedImages.value.push(e.target.result);
            };
            reader.readAsDataURL(blob);
        }
    }
}

const sendMessage = () => {
    const sendData = {
        ID: username,
        targetID: null,
        fileName: null,
        type: null,
        msgType: socket.MessageType.TYPE_GROUP_CHAT,
        data: message.value,
        SendTime: Date.now(),
    };
    socket.send(sendData);
    pastedImages.value = [];
    message.value = '';
};

socket.receive = (data) => {
    console.log("receive data:", data);
    const receiveData = JSON.parse(data.data);
    messages.value.push(receiveData);
};
socket.username = username;
// 创建WebSocket连接
const socketInstance = socket;


onMounted(() => {
    let access_token = localStorage.getItem('access_token');
    console.log("access_token:", access_token);
    if (access_token !== null && access_token !== undefined && access_token !== "") {
        islogin.value = true;
        console.log("init socket");
        socketInstance.init();
    }

});

</script>

<style scoped>
.title {
    margin-left: 5px;
}

.empty {
    text-align: center;
    color: rgb(185, 184, 182);
}

#wrapper {
    position: fixed;
    width: 300px;
    left: 0;
    bottom: 0;
}

.container {
    position: relative;
    width: 100%;
    gap: 20px;
    border-radius: 0px 10px 0px 0px;
    padding-bottom: 30px;
}

.head {
    background-color: rgb(40, 40, 40);
    text-align: center;
    color: rgb(175, 171, 171);
    font-size: 12px;
    padding: 1px;
}

.bottom {
    position: absolute;
    bottom: 0;
    width: 100%;
}

.msg_container {
    margin: 5px;
    width: 100%;
    display: flex;
    border-radius: 5px;
}

.msg {
    max-width: 50%;
}

.user {
    margin-right: 10px;
}

.content_default {
    background-color: #dddddd;
    position: relative;
    padding: 5px 5px 5px 10px;
    box-Shadow: var(--el-box-shadow-light);
}

/* 创建箭头的伪元素 */
.content_default::before {
    content: '';
    width: 10px;
    height: 10px;
    position: absolute;
    top: 15px;
    left: -5px;
    /* 箭头和内容之间的距离 */
    background-color: #dddddd;
    transform: translateY(-50%) rotate(45deg);
}

.content_active {
    background-color: #94d6a5;
}

/* 创建箭头的伪元素 */
.content_active::before {
    /* 箭头和内容之间的距离 */
    background-color: #94d6a5;
}

.image-preview {
    position: absolute;
    width: 100px;
    height: 100px;
    left: 101%;
    bottom: 5px;
}

.image-container {
    position: relative;
    width: 100%;
}

.img_wrap {
    height: 100%;
    padding: 2px;
    border-radius: 5px;
    display: inline-block;
    background-color: #fff;
    ;
}

.image-preview img {
    height: 100%;
}
</style>