import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, ConfigProvider, theme, Modal, Drawer } from 'antd';
import { useSearchParams } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import { ManagerHomeSection, MyEmployees, TestResults } from '../../components/manager';

const { Sider, Content } = Layout;

const ManagerDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'home';

  const [activeKey, setActiveKey] = useState(currentTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setActiveKey(currentTab);
  }, [currentTab]);

  const handleMenuClick = (key: string) => {
    setActiveKey(key);
    setSearchParams({ tab: key });
    if (isMobile) setDrawerOpen(false);
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Bosh sahifa' },
    { key: 'my-employees', icon: <UserOutlined />, label: 'Mening xodimlarim' },
    { key: 'test-results', icon: <BarChartOutlined />, label: 'Test natijalari' }
  ];

  const activeLabel = menuItems.find((m) => m.key === activeKey)?.label || 'Bosh sahifa';

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Tizimdan chiqdingiz');
    window.location.href = '/login';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 shrink-0">
            M
          </div>
          {(!collapsed || isMobile) && (
            <div className="whitespace-nowrap">
              <h1 className="text-white font-bold text-lg m-0 leading-none">Manager</h1>
              <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest opacity-80">
                Dashboard
              </span>
            </div>
          )}
        </div>
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white"
          />
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 px-2 mt-2">
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          onClick={(e) => handleMenuClick(e.key)}
          items={menuItems}
          style={{ border: 'none' }}
          inlineCollapsed={!isMobile && collapsed}
        />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800/50">
        <Button
          danger
          type="text"
          icon={<LogoutOutlined />}
          onClick={() => {
            if (isMobile) setDrawerOpen(false);
            setIsModalOpen(true);
          }}
          className={`w-full h-11 flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-start'
            } rounded-xl hover:bg-red-500/10 text-slate-400 font-medium transition-all`}
        >
          {(!collapsed || isMobile) && 'Chiqish'}
        </Button>
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          colorBgBase: '#020617',
          colorBgContainer: '#0f172a',
          colorBgLayout: '#020617',
          borderRadius: 12,
          colorBorderSecondary: '#1e293b',
        },
        components: {
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#2563eb',
            itemSelectedColor: '#ffffff',
            itemHoverBg: 'rgba(37, 99, 235, 0.1)',
            itemColor: '#94a3b8',
          },
          Table: {
            colorBgContainer: 'transparent',
            headerBg: '#0f172a',
            rowHoverBg: 'rgba(37,99,235,0.06)',
            borderColor: '#1e293b',
            colorText: '#e2e8f0',
            headerColor: '#94a3b8',
          },
          Input: {
            colorBgContainer: '#1e293b',
            colorBorder: '#334155',
            colorText: '#e2e8f0',
            colorTextPlaceholder: '#64748b',
          },
          Select: {
            colorBgContainer: '#1e293b',
            colorBorder: '#334155',
            colorText: '#e2e8f0',
            colorTextPlaceholder: '#64748b',
            optionSelectedBg: '#2563eb',
          },
        },
      }}
    >
      <Layout className="min-h-screen" style={{ backgroundColor: '#020617' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={260}
            collapsedWidth={72}
            style={{
              background: '#0f172a',
              borderRight: '1px solid #1e293b',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <SidebarContent />
          </Sider>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            placement="left"
            width={250}
            styles={{
              body: { padding: 0, background: '#0f172a' },
              header: { display: 'none' },
              wrapper: { background: '#0f172a' },
            }}
          >
            <SidebarContent />
          </Drawer>
        )}

        {/* Main Content */}
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 72 : 260,
            background: '#020617',
            minHeight: '100vh',
            transition: 'margin-left 0.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Mobile topbar */}
          {isMobile && (
            <div
              className="border-b border-[#1e293b] px-4 h-14 flex items-center justify-between sticky top-0 z-[99]"
              style={{ background: '#0f172a' }}
            >
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                className="text-slate-400 text-xl hover:text-white"
              />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <span className="text-white font-bold text-base">Manager</span>
              </div>
              <div className="w-8" />
            </div>
          )}

          {/* Page content */}
          <Content className="p-4 sm:p-6">
            <div className="max-w-[1400px] mx-auto">
              {/* Page header */}
              <div className="pb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{activeLabel}</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Bo'limingizga tegishli ma'lumotlar monitoringi
                </p>
              </div>

              {/* Content card */}
              <div
                className="rounded-2xl border border-slate-800/60 shadow-2xl shadow-black/40 p-4 sm:p-6"
                style={{ background: '#0f172a', minHeight: '70vh' }}
              >
                {activeKey === 'home' && <ManagerHomeSection />}
                {activeKey === 'my-employees' && <MyEmployees />}
                {activeKey === 'test-results' && <TestResults/>}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Logout modal */}
      <Modal
        title={null}
        open={isModalOpen}
        onOk={handleLogout}
        onCancel={() => setIsModalOpen(false)}
        centered
        okText="Chiqish"
        cancelText="Bekor qilish"
        okButtonProps={{ danger: true, size: 'large', className: 'rounded-xl px-8' }}
        cancelButtonProps={{ type: 'text', size: 'large', className: 'text-slate-400' }}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleOutlined className="text-3xl text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Tizimdan chiqmoqchimisiz?</h2>
          <p className="text-slate-400">Manager sessiyasi yakunlanadi.</p>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ManagerDashboard;

