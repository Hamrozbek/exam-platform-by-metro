import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, ConfigProvider, theme, Modal, Drawer } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { DepartmentsSection, ExamsSection, HomeSection, ManagersSection, UsersSection } from '../../components/admin';
import { TestResults } from '../../components/manager';
import {
  HomeOutlined, TeamOutlined, UserOutlined,
  FileTextOutlined, LogoutOutlined, ExclamationCircleOutlined,
  ApartmentOutlined, MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined, FileDoneOutlined
} from '@ant-design/icons';
import { toast } from 'sonner';

const { Sider, Content } = Layout;

const Superadmindashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'home';

  const [activeKey, setActiveKey] = useState(currentTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Mobile uchun drawer
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setCollapsed(false);
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
    { key: 'bolim', icon: <ApartmentOutlined />, label: "Bo'limlar" },
    { key: 'managers', icon: <TeamOutlined />, label: 'Managerlar' },
    { key: 'users', icon: <UserOutlined />, label: 'Foydalanuvchilar' },
    { key: 'exams', icon: <FileTextOutlined />, label: 'Testlar' },
    { key: 'results', icon: <FileDoneOutlined />, label: 'Natijalar' },
  ];

  const activeLabel = menuItems.find(m => m.key === activeKey)?.label || 'Bosh sahifa';

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Tizimdan chiqdingiz");
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 shrink-0">
            S
          </div>
          {(!collapsed || isMobile) && (
            <div className="whitespace-nowrap">
              <h1 className="text-white font-bold text-lg m-0 leading-none">Super Admin</h1>
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest opacity-80">Dashboard</span>
            </div>
          )}
        </div>
        {/* Desktop collapse button */}
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 text-lg hover:text-white"
          />
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 px-2 mt-4">
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
          className={`w-full h-12 flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-start'} rounded-xl hover:bg-red-500/10 text-slate-400 font-medium transition-all`}
        >
          {(!collapsed || isMobile) && "Chiqish"}
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
            width={280}
            collapsedWidth={80}
            style={{
              background: '#0f172a',
              borderRight: '1px solid #1e293b',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              zIndex: 100,
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
            width={260}
            styles={{
              body: { padding: 0, background: '#0f172a' },
              header: { display: 'none' },
              wrapper: { background: '#0f172a' },
            }}
          >
            <SidebarContent />
          </Drawer>
        )}

        {/* Main Layout */}
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 280,
            background: '#020617',
            minHeight: '100vh',
            transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Mobile Header */}
          {isMobile && (
            <div
              style={{
                background: '#0f172a',
                borderBottom: '1px solid #1e293b',
                padding: '0 16px',
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 99,
              }}
            >
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                className="text-slate-400 text-xl hover:text-white"
              />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  S
                </div>
                <span className="text-white font-bold text-base">Super Admin</span>
              </div>
              <div className="w-8" />
            </div>
          )}

          <Content className="p-4 sm:p-6 md:p-8">
            <div className="max-w-[1400px] mx-auto min-h-full">
              {/* Page Title */}
              <div className="pb-4 sm:pb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white capitalize">
                  {activeLabel}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Tizimdagi ma'lumotlarni boshqarish
                </p>
              </div>

              {/* Content Card */}
              <div className="bg-[#0f172a] p-4 sm:p-6 rounded-2xl border border-slate-800/60 shadow-2xl shadow-black/40 min-h-[70vh]">
                {activeKey === 'home' && <HomeSection />}
                {activeKey === 'bolim' && <DepartmentsSection />}
                {activeKey === 'managers' && <ManagersSection />}
                {activeKey === 'users' && <UsersSection />}
                {activeKey === 'exams' && <ExamsSection />}
                {activeKey === 'results' && <TestResults />}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Logout Modal */}
      <Modal
        title={null}
        open={isModalOpen}
        onOk={handleLogout}
        onCancel={() => setIsModalOpen(false)}
        centered
        okText="Chiqish"
        cancelText="Bekor qilish"
        okButtonProps={{ danger: true, size: 'large', className: 'px-8 rounded-xl' }}
        cancelButtonProps={{ type: 'text', size: 'large', className: 'text-slate-400' }}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleOutlined className="text-3xl text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Tizimdan chiqmoqchimisiz?</h2>
          <p className="text-slate-400">Chiqish tugmasini bossangiz, joriy sessiyangiz yakunlanadi.</p>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default Superadmindashboard;