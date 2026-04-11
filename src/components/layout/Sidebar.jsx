import React from 'react';
import { Layout, Menu } from 'antd';
import { menuItems } from '../../config/menuConfig';
import logo from '../../assets/temp_img.svg';

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, location, handleMenuClick }) => {
    return (
        <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed} 
            breakpoint="lg" 
            onBreakpoint={(broken) => {
                if (broken) setCollapsed(true);
            }}
        >
            <div className="demo-logo-vertical" style={{
                height: 64,
                margin: 0,
                background: 'rgba(255, 255, 255, 0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '0' : '0 24px',
                overflow: 'hidden',
                transition: 'all 0.2s'
            }}>
                <img src={logo} alt="LankaResQ" style={{ height: 32, width: 'auto' }} />
                {!collapsed && <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginLeft: 10, whiteSpace: 'nowrap' }}>LankaResQ</span>}
            </div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
            />
        </Sider>
    );
};

export default Sidebar;
