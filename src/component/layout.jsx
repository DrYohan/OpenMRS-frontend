import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sideBar';
import TopBar from './topBar';
import Footer from './footer';
import ThemeConfig from './themeConfig';

const Layout = () => {
    return (
        <>
            <div id="wrapper">
                <Sidebar />
                <div className="content-page">
                    <TopBar />
                    <Outlet />
                    <Footer />
                </div>
            </div>
            <ThemeConfig />
        </>
    );
}; 

export default Layout;
