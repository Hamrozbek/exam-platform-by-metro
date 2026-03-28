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
  LockOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';

const { Option } = Select;

const ManagersSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mgrData, deptData, empData] = await Promise.all([
        apiFetch('/users/managers/'),
        apiFetch('/departments/'),
        apiFetch('/users/employees/'),
      ]);

      const managersList = mgrData?.results || (Array.isArray(mgrData) ? mgrData : []);
      const departmentsList = deptData?.results || (Array.isArray(deptData) ? deptData : []);
      const employeesList = empData?.results || (Array.isArray(empData) ? empData : []);

      // Map students to managers based on department
      const processedManagers = managersList.map((mgr: any) => {
        const students = employeesList.filter((emp: any) => emp.department === mgr.department);
        return {
          ...mgr,
          students,
          students_count: students.length
        };
      });

      setManagers(processedManagers);
      setDepartments(departmentsList);
    } catch {
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
      className: 'dark-confirm-modal',
      onOk: async () => {
        try {
          await apiFetch(`/users/managers/${id}/delete/`, { method: 'DELETE' });
          toast.success("Manager o'chirildi");
          fetchData();
        } catch {
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
        body: JSON.stringify({ ...values, description: values.description || '' }),
      });
      toast.success("Yangi boshliq qo'shildi");
      setIsAddModalOpen(false);
      form.resetFields();
      fetchData();
    } catch {
      toast.error("Xatolik: Bunday username mavjud bo'lishi mumkin");
    } finally {
      setLoading(false);
    }
  };

  const filtered = managers.filter((m: any) =>
    m.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    m.username?.toLowerCase().includes(searchText.toLowerCase())
  );

  // --- MOBILE CARD ---
  const MobileCard = ({ record }: { record: any; index: number }) => (
    <div className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            className="bg-indigo-500/20 text-indigo-400 shrink-0"
            icon={<UserOutlined />}
          />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm m-0 truncate">
              {record.first_name} {record.last_name}
            </p>
            <p className="text-slate-500 text-xs m-0">@{record.username}</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined className="text-blue-400" />}
            onClick={() => { setSelectedManager(record); setIsViewModalOpen(true); }}
            className="hover:bg-blue-500/10 rounded-lg"
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            className="hover:bg-red-500/10 rounded-lg"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Tag className="bg-blue-500/10 border-none text-blue-400 px-3 rounded-full text-[11px] m-0">
          {record.department || "Bo'limsiz"}
        </Tag>
        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full">
          <TeamOutlined className="text-xs" />
          <span className="text-xs font-bold font-mono">{record.students_count || 0}</span>
        </div>
      </div>
    </div>
  );

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
      ),
    },
    {
      title: "Bo'lim",
      dataIndex: 'department',
      responsive: ['md'] as any,
      render: (d: string) => (
        <Tag className="bg-blue-500/10 border-none text-blue-400 px-3 rounded-full text-[11px]">
          {d || "Bo'limsiz"}
        </Tag>
      ),
    },
    {
      title: 'Talabalar',
      dataIndex: 'students_count',
      responsive: ['sm'] as any,
      render: (count: number) => (
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit px-3 py-1 rounded-full">
          <TeamOutlined className="text-xs" />
          <span className="text-xs font-bold font-mono">{count || 0}</span>
        </div>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 100,
      render: (r: any) => (
        <Space size="middle">
          <Tooltip title="Batafsil ko'rish">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => { setSelectedManager(r); setIsViewModalOpen(true); }}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(r.id)}
              className="hover:bg-red-500/10"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-3 space-y-4 sm:space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input
          placeholder="Managerlarni qidirish..."
          prefix={<SearchOutlined className="text-slate-500" />}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full sm:w-72 h-11 sm:h-12 bg-slate-900 border-slate-800 text-white rounded-2xl"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalOpen(true)}
          className="h-11 sm:h-12 px-5 sm:px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 border-none font-bold shadow-lg shadow-blue-600/20"
        >
          <span className="hidden sm:inline">Manager qo'shish</span>
          <span className="sm:hidden">Qo'shish</span>
        </Button>
      </div>

      {/* Jadval / Mobile kartalar */}
      {isMobile ? (
        <div>
          {filtered.length === 0 && !loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Manager topilmadi</div>
          ) : (
            filtered.map((m: any, idx: number) => (
              <MobileCard key={m.id} record={m} index={idx} />
            ))
          )}
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 8, className: 'p-4', showSizeChanger: false }}
            className="custom-dark-table"
            scroll={{ x: 500 }}
          />
        </div>
      )}

      {/* VIEW MODAL */}
      <Modal
        title={null}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        centered
        width="95%"
        style={{ maxWidth: 600 }}
        closeIcon={null}
        modalRender={(modal) => (
          <div className="bg-[#0b1120] border border-slate-800 rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl">
            {modal}
          </div>
        )}
      >
        {selectedManager && (
          <div className="p-5 sm:p-8">
            {/* Profil header */}
            <div className="flex justify-between items-start mb-6 sm:mb-8 gap-3">
              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                <Avatar
                  size={isMobile ? 52 : 70}
                  className="bg-gradient-to-tr from-indigo-600 to-blue-600 border-2 border-slate-800 shadow-xl shrink-0"
                  icon={<UserOutlined />}
                />
                <div className="min-w-0">
                  <h2 className="text-white text-lg sm:text-xl font-bold m-0 tracking-tight truncate">
                    {selectedManager.first_name} {selectedManager.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Tag className="bg-indigo-500/10 border-none text-indigo-400 m-0 px-2 rounded-md font-mono text-[11px]">
                      Manager
                    </Tag>
                    <span className="text-slate-500 text-xs">ID: {selectedManager.id}</span>
                  </div>
                </div>
              </div>
              <Button
                type="text"
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full shrink-0"
              >✕</Button>
            </div>

            {/* Login & Password */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-indigo-500/20 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <LockOutlined className="text-indigo-400" />
                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                  Kirish ma'lumotlari
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-slate-500 text-[9px] font-bold uppercase pl-1 m-0">Username</p>
                  <div className="bg-slate-950/80 px-3 sm:px-4 py-2 rounded-xl border border-slate-800">
                    <code className="text-indigo-400 font-mono text-xs sm:text-sm break-all">
                      {selectedManager.username}
                    </code>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 text-[9px] font-bold uppercase pl-1 m-0">Parol</p>
                  <div className="bg-slate-950/80 px-3 sm:px-4 py-2 rounded-xl border border-slate-800">
                    <code className="text-emerald-400 font-mono text-xs sm:text-sm break-all">
                      {selectedManager.password ?? '—'}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Info kartalar */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-8">
              <InfoCard icon={<PhoneOutlined />} label="Telefon" value={selectedManager.phone_number || '—'} color="blue" />
              <InfoCard icon={<ApartmentOutlined />} label="Bo'lim" value={selectedManager.department || 'N/A'} color="purple" />
            </div>

            {/* Talabalar */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 m-0">
                  <TeamOutlined className="text-blue-500" /> Biriktirilgan Talabalar
                </h3>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                  Jami: {selectedManager.students?.length || 0}
                </span>
              </div>

              <div className="max-h-40 sm:max-h-48 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {selectedManager.students?.length > 0 ? (
                  selectedManager.students.map((student: any) => (
                    <div
                      key={student.id}
                      className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Avatar size="small" className="bg-slate-800 shrink-0" icon={<UserOutlined />} />
                        <span className="text-slate-200 text-sm font-medium truncate">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[10px] font-mono shrink-0">@{student.username}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                    <p className="text-slate-600 italic text-xs m-0">Talabalar mavjud emas</p>
                  </div>
                )}
              </div>
            </div>

            <Button
              block
              onClick={() => setIsViewModalOpen(false)}
              className="mt-5 sm:mt-8 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold"
            >
              Yopish
            </Button>
          </div>
        )}
      </Modal>

      {/* ADD MODAL */}
      <Modal
        title={null}
        open={isAddModalOpen}
        onCancel={() => { setIsAddModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
        width="95%"
        style={{ maxWidth: 450 }}
        modalRender={(modal) => (
          <div className="bg-[#0b1120] border border-slate-800 rounded-[24px] overflow-hidden shadow-2xl">
            {modal}
          </div>
        )}
      >
        <div className="p-5 sm:p-6">
          <div className="mb-5 sm:mb-6 flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-blue-500/10 rounded-2xl shrink-0">
              <UserAddOutlined className="text-blue-500 text-lg sm:text-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white m-0">Yangi Manager</h2>
              <p className="text-slate-500 text-xs m-0">Tizim uchun yangi boshqaruvchi qo'shish</p>
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Form.Item
                label={<span className="text-slate-400 text-xs">Ism</span>}
                name="first_name"
                rules={[{ required: true, message: 'Ismni kiriting' }]}
              >
                <Input
                  className="h-10 sm:h-11 bg-slate-900 border-slate-800 text-white rounded-xl focus:border-blue-500"
                  placeholder="Ali"
                />
              </Form.Item>
              <Form.Item
                label={<span className="text-slate-400 text-xs">Familiya</span>}
                name="last_name"
                rules={[{ required: true, message: 'Familiyani kiriting' }]}
              >
                <Input
                  className="h-10 sm:h-11 bg-slate-900 border-slate-800 text-white rounded-xl focus:border-blue-500"
                  placeholder="Valiyev"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="text-slate-400 text-xs">Username</span>}
              name="username"
              rules={[{ required: true, message: 'Username kiriting' }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-600" />}
                className="h-10 sm:h-11 bg-slate-900 border-slate-800 text-white rounded-xl focus:border-blue-500"
                placeholder="avaliyev"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-slate-400 text-xs">Bo'lim</span>}
              name="department_id"
              rules={[{ required: true, message: "Bo'limni tanlang" }]}
            >
              <Select
                placeholder="Bo'limni tanlang"
                className="h-10 sm:h-11 custom-dark-select"
                dropdownClassName="custom-dark-dropdown"
              >
                {departments.map((d: any) => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-11 sm:h-12 bg-blue-600 hover:bg-blue-500 border-none rounded-xl font-bold mt-2 shadow-lg shadow-blue-600/20"
            >
              Manager tasdiqlash
            </Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

const InfoCard = ({ icon, label, value, color }: any) => {
  const colorClasses: any = {
    blue: 'text-blue-400 bg-blue-500/5',
    purple: 'text-purple-400 bg-purple-500/5',
    emerald: 'text-emerald-400 bg-emerald-500/5',
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col gap-1 hover:border-slate-700 transition-all">
      <span className={`${colorClasses[color] || 'text-slate-400'} text-base sm:text-lg mb-1`}>{icon}</span>
      <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider">{label}</span>
      <span className="text-slate-200 text-xs sm:text-sm font-medium truncate">{value}</span>
    </div>
  );
};

export default ManagersSection;