<template>
    <div class="login-body">
        <div class="login-panel">
            <div class="login-title">登录</div>
            <el-form :model="formData" :rules="rules" ref="formDataRef">
                <el-form-item prop="username">
                    <el-input placeholder="请输入账号" v-model="formData.username" size="large" type="text">
                        <template #prefix>
                            <el-icon>
                                <User />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input placeholder="请输入密码" v-model="formData.password" size="large" type="password"
                        @keyup.enter.native="login()">
                        <template #prefix>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <!-- <el-form-item label="">
                    <div class="check-code-panel">
                        <el-input placeholder="请输入验证码" v-model="formData.checkCode" class="input-panel" />
                        <img src="checkCodeUrl" class="check-code">
                    </div>
                </el-form-item> -->
                <!-- <el-form-item label="">
                    <el-checkbox label="记住密码" name="type" />
                </el-form-item> -->
                <el-form-item label="">
                    <el-button type="primary" style="width: 100%;" @click="login()" size="large" >GO</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive,getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus';
import request from '../utils/request';		//这里使用自行封装的axios，下文已给出，照搬后修改运行端口即可
import axios from 'axios';
import router from '../router';
import { islogin } from '../../store';
// const checkCodeUrl = "api/checkCode?" + new Date().getTime();
//表单
const formDataRef = ref();
let formData = reactive({
    username: "",
    password: ""
});
const rules = {
    username: [{
        required: true,
        message: "请输入用户名"
    }],
    password: [{
        required: true,
        message: "请输入密码"
    }],
    // checkCode: [{
    //     required: true,
    //     message: "请输入验证码"
    // }],
}

const login = () => {
    var form_obj = JSON.parse(JSON.stringify(formData));
    axios.get("/req/user/login", {params: form_obj}).then(res => {
        // console.log(res.data.data);
        if (res.data.code == 200) {
            ElMessage({
                message: '登录成功',
                type: 'success',
            })
            islogin.value = true;
            window.localStorage.setItem("access_token", res.data.data.token);
            localStorage.setItem("username", JSON.parse(JSON.stringify(formData.username)));
            router.push({ path: '/home', query: { username: formData.username } });

        } else {
            ElMessage.error('账号或密码错误！！！登录失败！！！')
        }
    });
};
</script>

<style lang="scss" scoped>
.login-body {
    background: url("../assets/bg1.jpg") no-repeat center center;
    height: 100%;
    width: 100%;
    background-size: cover;
    position: absolute;
    left: 0;
    top: 0;

    .login-panel {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;

        padding: 25px;
        width: 26%;
        min-width: 460px;
        height: 30%;
        min-height: 300px;
        border-radius: 0px;
        backdrop-filter: blur(20px);
        background-color: rgba(255, 255, 255, 0.3);
        box-shadow: rgba(0, 0, 0, 0.3) 2px 8px 8px;

        .login-title {
            font-size: 22px;
            text-align: center;
            margin-bottom: 22px;
            color: #fff;
        }
    }
}
</style>
