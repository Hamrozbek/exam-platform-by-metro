import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Modal, Form, Tag, Space, Avatar, Tooltip } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  ApartmentOutlined,
  EyeOutlined,
  TeamOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';

const { Option } = Select;

const ManagersSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Modallar uchun statelar
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any>(null);

  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mgrData, deptData] = await Promise.all([
        apiFetch('/users/managers/'),
        apiFetch('/departments/')
      ]);
      setManagers(mgrData || []);
      setDepartments(deptData || []);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: <span className="text-white font-bold">Managerni o'chirish</span>,
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: <span className="text-slate-400">Haqiqatan ham ushbu boshliqni tizimdan o'chirmoqchimisiz?</span>,
      okText: "O'chirish",
      okType: 'danger',
      centered: true,
      className: "dark-confirm-modal",
      onOk: async () => {
        try {
          await apiFetch(`/users/managers/${id}/delete/`, { method: 'DELETE' });
          toast.success("Manager o'chirildi");
          fetchData();
        } catch (error) {
          toast.error("O'chirishda xatolik yuz berdi");
        }
      },
    });
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await apiFetch('/users/create-manager/', {
        method: 'POST',
        body: JSON.stringify({ ...values, description: values.description || "" }),
      });
      toast.success("Yangi boshliq qo'shildi");
      setIsAddModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      toast.error("Xatolik: Bunday username mavjud bo'lishi mumkin");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '#', width: 50, render: (_: any, __: any, i: number) => i + 1 },
    {
      title: 'F.I.O',
      key: 'fullname',
      render: (r: any) => (
        <Space>
          <Avatar className="bg-indigo-500/20 text-indigo-400" icon={<UserOutlined />} />
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm">{r.first_name} {r.last_name}</span>
            <span className="text-slate-500 text-[11px]">@{r.username}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Bo\'lim',
      dataIndex: 'department',
      render: (d: string) => (
        <Tag className="bg-blue-500/10 border-none text-blue-400 px-3 rounded-full text-[11px]">
          {d || 'Bo\'limsiz'}
        </Tag>
      )
    },
    {
      title: 'Talabalar',
      dataIndex: 'students_count',
      render: (count: number) => (
        <BadgeCount count={count || 0} icon={<TeamOutlined />} color="emerald" />
      )
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      render: (r: any) => (
        <Space size="middle">
          <Tooltip title="Batafsil ko'rish">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => { setSelectedManager(r); setIsViewModalOpen(true); }}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(r.id)}
              className="hover:bg-red-500/10 flex items-center justify-center"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 space-y-6 animate-in fade-in duration-500">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Input
          placeholder="Managerlarni qidirish..."
          prefix={<SearchOutlined className="text-slate-500" />}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full md:w-80 h-12 bg-slate-900 border-slate-800 text-white rounded-2xl focus:border-blue-500"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 border-none font-bold shadow-lg shadow-blue-600/20"
        >
          Manager qo'shish
        </Button>
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <Table
          columns={columns}
          dataSource={managers.filter((m: any) =>
            m.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            m.username?.toLowerCase().includes(searchText.toLowerCase())
          )}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 8, className: "p-4" }}
          className="custom-dark-table"
        />
      </div>

      {/* VIEW MODAL (Batafsil ma'lumot) */}
      <Modal
        title={null}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        centered
        width={650}
        closeIcon={null}
        className="dark-modal-custom"
        modalRender={(modal) => (
          <div className="bg-[#0b1120] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl">
            {modal}
          </div>
        )}
      >
        {selectedManager && (
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                <Avatar size={80} className="bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-slate-800 shadow-2xl flex items-center justify-center text-3xl" icon={<UserOutlined />} />
                <div>
                  <h2 className="text-white text-2xl font-black m-0 tracking-tight">
                    {selectedManager.first_name} {selectedManager.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="bg-blue-500/10 border-none text-blue-400 m-0 px-2 rounded-md font-mono">@{selectedManager.username}</Tag>
                    <span className="text-slate-500 text-xs">• Manager</span>
                  </div>
                </div>
              </div>
              <Button type="text" onClick={() => setIsViewModalOpen(false)} className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full">✕</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <InfoCard icon={<PhoneOutlined />} label="Telefon" value={selectedManager.phone_number} color="blue" />
              <InfoCard icon={<ApartmentOutlined />} label="Bo'lim" value={selectedManager.department || 'N/A'} color="purple" />
              <InfoCard icon={<TeamOutlined />} label="Talabalar" value={`${selectedManager.students?.length || 0} ta`} color="emerald" />
            </div>

            {/* Students List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <TeamOutlined className="text-blue-500" />
                  Biriktirilgan Talabalar
                </h3>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                  Jami: {selectedManager.students?.length || 0}
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {selectedManager.students && selectedManager.students.length > 0 ? (
                  selectedManager.students.map((student: any) => (
                    <div key={student.id} className="group bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/50 p-3 rounded-2xl flex items-center justify-between transition-all">
                      <div className="flex items-center gap-3">
                        <Avatar className="bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors" icon={<IdcardOutlined />} />
                        <div className="flex flex-col">
                          <span className="text-slate-200 text-sm font-medium">{student.first_name} {student.last_name}</span>
                          <span className="text-slate-500 text-[10px]">ID: {student.id} | @{student.username}</span>
                        </div>
                      </div>
                      <Tag color="blue" className="bg-blue-500/5 border-blue-500/20 text-[10px] m-0 rounded-lg">Student</Tag>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <p className="text-slate-600 italic text-sm m-0">Hali talabalar biriktirilmagan</p>
                  </div>
                )}
              </div>
            </div>

            <Button block onClick={() => setIsViewModalOpen(false)} className="mt-8 h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold">
              Yopish
            </Button>
          </div>
        )}
      </Modal>

      {/* ADD MODAL (Yangi manager) */}
      <Modal
        title={null}
        open={isAddModalOpen}
        onCancel={() => { setIsAddModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
        width={500}
        className="dark-modal"
      >
        <div className="p-4 bg-slate-950">
          {/* ... (Sizdagi Form kodi xuddi shunday qoladi) ... */}
          <div className="mb-6 flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <UserAddOutlined className="text-blue-500 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white m-0">Yangi Manager</h2>
              <p className="text-slate-500 text-sm">Ma'lumotlarni to'ldiring</p>
            </div>
          </div>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label={<span className="text-slate-400">Ism</span>} name="first_name" rules={[{ required: true }]}>
                <Input className="h-11 bg-slate-900 border-slate-800 text-white rounded-xl" />
              </Form.Item>
              <Form.Item label={<span className="text-slate-400">Familiya</span>} name="last_name" rules={[{ required: true }]}>
                <Input className="h-11 bg-slate-900 border-slate-800 text-white rounded-xl" />
              </Form.Item>
            </div>
            <Form.Item label={<span className="text-slate-400">Username</span>} name="username" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} className="h-11 bg-slate-900 border-slate-800 text-white rounded-xl" />
            </Form.Item>
            <Form.Item label={<span className="text-slate-400 font-medium">Bo'lim</span>} name="department_id" rules={[{ required: true }]}>
              <Select placeholder="Bo'limni tanlang" className="h-11 custom-dark-select">
                {departments.map((d: any) => <Option key={d.id} value={d.id}>{d.name}</Option>)}
              </Select>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className="h-12 bg-blue-600 rounded-xl font-bold mt-4">Saqlash</Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

// Yordamchi Komponentlar
const InfoCard = ({ icon, label, value, color }: any) => (
  <div className={`bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1`}>
    <span className={`text-${color}-500 text-lg mb-1`}>{icon}</span>
    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{label}</span>
    <span className="text-slate-200 text-sm font-medium truncate">{value}</span>
  </div>
);

const BadgeCount = ({ count, icon, color }: any) => (
  <div className={`flex items-center gap-2 bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 w-fit px-3 py-1 rounded-full`}>
    <span className="text-xs">{icon}</span>
    <span className="text-xs font-bold font-mono">{count}</span>
  </div>
);

export default ManagersSection;