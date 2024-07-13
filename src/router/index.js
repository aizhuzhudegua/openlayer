import { createRouter, createWebHashHistory } from "vue-router";
import Demo from '../views/demo.vue'
import Home from '../views/home.vue'
import Login from '../views/login.vue'

const routes = [
    {
        path: '/login',
        component: Login
    },
    {
        path: '/demo',
        component: Demo
    },
    {
        path: '/home',
        component: Home
    },

    // {
    //   path:'/list',
    //   component:List
    // },
    // {
    //   path:'/detail',
    //   component:Detail
    // },
    // {
    //   path:'/',
    //   redirect:'/home' 
    // }
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 导航守卫：使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
router.beforeEach((to, from, next) => {
    if (to.path === '/login') {
        next();
    } else {
        let token = localStorage.getItem('access_token');

        if (token === null || token === '') {
            next('/login');
        } else {
            next();
        }
    }
});

export default router
