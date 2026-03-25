import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, ConfigProvider, theme, Modal } from 'antd';
import { useSearchParams } from 'react-router-dom'; // URL parametrlar bilan ishlash uchun
import {
  HomeOutlined, TeamOutlined, UserOutlined,
  FileTextOutlined, LogoutOutlined, ExclamationCircleOutlined,
  ApartmentOutlined, MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';
import { toast } from 'sonner';

// Bo'limlar (Sizdagi index.ts dan import qilinadi)
import { DepartmentsSection, ExamsSection, HomeSection, ManagersSection, UsersSection } from "./index"


const { Sider, Content } = Layout;

const Superadmindashboard: React.FC = () => {
  // 1. URL dagi parametrlarni boshqarish uchun hook
  const [searchParams, setSearchParams] = useSearchParams();

  // 2. Boshlang'ich holatni URL dan olamiz (agar bo'sh bo'lsa 'home' ni oladi)
  const currentTab = searchParams.get('tab') || 'home';

  const [activeKey, setActiveKey] = useState(currentTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // 3. URL dagi tab o'zgarganda (masalan brauzerda orqaga tugmasi bosilsa) stateni yangilash
  useEffect(() => {
    setActiveKey(currentTab);
  }, [currentTab]);

  // 4. Menyu elementini bosganda ham stateni, ham URLni yangilash
  const handleMenuClick = (key: string) => {
    setActiveKey(key);
    setSearchParams({ tab: key });
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Bosh sahifa' },
    { key: 'bolim', icon: <ApartmentOutlined />, label: 'Bo\'limlar' },
    { key: 'managers', icon: <TeamOutlined />, label: 'Managerlar' },
    { key: 'users', icon: <UserOutlined />, label: 'Foydalanuvchilar' },
    { key: 'exams', icon: <FileTextOutlined />, label: 'Testlar' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Tizimdan chiqdingiz");
    window.location.href = "/login";
  };

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
            zIndex: 100
          }}
        >
          <div className="flex flex-col h-full">
            <div className="p-5 flex items-center justify-between">
              {!collapsed && (
                <div className="flex items-center gap-3 animate-in fade-in duration-300">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">S</div>
                  <div className="whitespace-nowrap">
                    <h1 className="text-white font-bold text-lg m-0 leading-none">Super Admin</h1>
                    <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest opacity-80">Dashboard</span>
                  </div>
                </div>
              )}
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className={`text-slate-400 text-lg hover:text-white ${collapsed ? 'w-full' : ''}`}
              />
            </div>

            <div className="flex-1 px-2 mt-4">
              <Menu
                mode="inline"
                selectedKeys={[activeKey]}
                onClick={(e) => handleMenuClick(e.key)}
                items={menuItems}
                style={{ border: 'none' }}
              />
            </div>

            <div className="p-6 border-t border-slate-800/50">
              <Button
                danger
                type="text"
                icon={<LogoutOutlined />}
                onClick={() => setIsModalOpen(true)}
                className={`w-full h-12 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} rounded-xl hover:bg-red-500/10 text-slate-400 font-medium transition-all`}
              >
                {!collapsed && "Chiqish"}
              </Button>
            </div>
          </div>
        </Sider>

        <Layout style={{
          marginLeft: collapsed ? 80 : 280,
          background: '#020617',
          minHeight: '100vh',
          transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Content className="p-8">
            <div className="max-w-[1400px] mx-auto min-h-full">
              <div className="pb-6">
                <h2 className="text-2xl font-bold text-white capitalize">
                  {activeKey === 'home' ? 'Bosh sahifa' : activeKey === 'bolim' ? 'Bo\'limlar' : activeKey}
                </h2>
                <p className="text-slate-500 text-sm">Tizimdagi ma'lumotlarni boshqarish</p>
              </div>

              <div className="bg-[#0f172a] p-6 rounded-[24px] border border-slate-800/60 shadow-2xl shadow-black/40 min-h-[75vh]">
                {activeKey === 'home' && <HomeSection />}
                {activeKey === 'bolim' && <DepartmentsSection />}
                {activeKey === 'managers' && <ManagersSection />}
                {activeKey === 'users' && <UsersSection />}
                {activeKey === 'exams' && <ExamsSection />}
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