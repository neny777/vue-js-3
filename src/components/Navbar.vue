<script setup>
import user from '@/assets/img/user2-160x160.jpg';
import { useTheme } from '@/composables/useTheme';
import { useRouter } from 'vue-router';
import axiosInstance from '@/axiosInstance';

const router = useRouter();
const { theme, setTheme } = useTheme();

async function logout() {
    try {
        // Envia o logout ao backend
        await axiosInstance.post('/authentication/logout');

        // Remove os tokens do armazenamento local
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        // Redireciona para a página de login
        router.push('/login');
    } catch (error) {
        showToast('erro', 'Erro ao encerrar a sessão.');
    }
}
</script>
<template>
    <nav class="app-header navbar navbar-expand bg-body"> <!--begin::Container-->
        <!--<nav class="app-header navbar navbar-expand bg-white"> begin::Container-->
        <div class="container-fluid"> <!--begin::Start Navbar Links-->
            <ul class="navbar-nav">
                <li class="nav-item"> <a class="nav-link" data-lte-toggle="sidebar" href="#" role="button"> <i
                            class="bi bi-list"></i> </a> </li>
                <li class="nav-item d-none d-md-block">
                    <RouterLink to="/home" class="nav-link">Home</RouterLink>
                </li>
            </ul> <!--end::Start Navbar Links--> <!--begin::End Navbar Links-->
            <ul class="navbar-nav ms-auto"><!--begin::Notifications Dropdown Menu-->
                <li class="nav-item dropdown">
                    <a class="nav-link" data-bs-toggle="dropdown" href="#">
                        <i class="bi bi-bell"></i>
                        <span class="navbar-badge badge text-bg-warning">15</span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                        <span class="dropdown-item dropdown-header">15 Notifications</span>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item">
                            <i class="bi bi-envelope me-2"></i> 4 new messages
                            <span class="float-end text-secondary fs-7">3 mins</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item">
                            <i class="bi bi-people me-2"></i> 8 friend requests
                            <span class="float-end text-secondary fs-7">12 hours</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item">
                            <i class="bi bi-file-earmark me-2"></i> 3 new reports
                            <span class="float-end text-secondary fs-7">2 days</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item dropdown-footer"> See All Notifications </a>
                    </div>
                </li>
                <!--end::Notifications Dropdown Menu--><!--begin::Fullscreen Toggle-->
                <li class="nav-item"> <a class="nav-link" href="#" data-lte-toggle="fullscreen"> <i
                            data-lte-icon="maximize" class="bi bi-arrows-fullscreen"></i> <i data-lte-icon="minimize"
                            class="bi bi-fullscreen-exit" style="display: none;"></i> </a>
                </li> <!--end::Fullscreen Toggle-->
                <!--begin::Color Mode Menu Dropdown-->
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item dropdown">
                        <button
                            class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center"
                            id="bd-theme" type="button" aria-expanded="false" data-bs-toggle="dropdown"
                            data-bs-display="static">
                            <span class="theme-icon-active">
                                <i
                                    :class="theme === 'light' ? 'bi bi-sun' : theme === 'dark' ? 'bi bi-moon' : 'bi bi-circle-half'"></i>
                            </span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="bd-theme-text">
                            <li>
                                <button type="button" class="dropdown-item d-flex align-items-center"
                                    :class="{ active: theme === 'light' }" @click="setTheme('light')">
                                    <i class="bi bi-sun me-2"></i>
                                    Light
                                </button>
                            </li>
                            <li>
                                <button type="button" class="dropdown-item d-flex align-items-center"
                                    :class="{ active: theme === 'dark' }" @click="setTheme('dark')">
                                    <i class="bi bi-moon me-2"></i>
                                    Dark
                                </button>
                            </li>
                            <li>
                                <button type="button" class="dropdown-item d-flex align-items-center"
                                    :class="{ active: theme === 'auto' }" @click="setTheme('auto')">
                                    <i class="bi bi-circle-half me-2"></i>
                                    Auto
                                </button>
                            </li>
                        </ul>
                    </li>
                </ul>

                <li class="nav-item"> <a class="nav-link" href="#" @click="logout"><i class="bi bi-door-closed"></i></a>
                </li>
                <!--end::Color Mode Menu Dropdown--><!--begin::User Menu Dropdown-->
                <li class="nav-item dropdown user-menu"> <a href="#" class="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"> <img :src="user" class="user-image rounded-circle shadow"
                            alt="User Image"> <span class="d-none d-md-inline">Alexander
                            Pierce</span> </a>
                    <ul class="dropdown-menu dropdown-menu-lg dropdown-menu-end"> <!--begin::User Image-->
                        <li class="user-header text-bg-primary"> <img :src="user" class="rounded-circle shadow"
                                alt="User Image">
                            <p>
                                Alexander Pierce - Web Developer
                                <small>Member since Nov. 2023</small>
                            </p>
                        </li> <!--end::User Image--> <!--begin::Menu Body-->
                        <li class="user-body"> <!--begin::Row-->
                            <div class="row">
                                <div class="col-4 text-center"> <a href="#">Followers</a> </div>
                                <div class="col-4 text-center"> <a href="#">Sales</a> </div>
                                <div class="col-4 text-center"> <a href="#">Friends</a> </div>
                            </div> <!--end::Row-->
                        </li> <!--end::Menu Body--> <!--begin::Menu Footer-->
                        <li class="user-footer"> <a href="#" class="btn btn-default btn-flat">Profile</a> <a href="#"
                                class="btn btn-default btn-flat float-end">Sign out</a> </li>
                        <!--end::Menu Footer-->
                    </ul>
                </li> <!--end::User Menu Dropdown-->
            </ul> <!--end::End Navbar Links-->
        </div> <!--end::Container-->
    </nav> <!--end::Header--> <!--begin::Sidebar-->
</template>