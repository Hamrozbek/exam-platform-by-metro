import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Table, Space, Tag, Avatar, Modal, Progress, Button } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';

const { Option } = Select;

const HomeSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    managers: 0,
    employees: 0,
    exams: 0,
    departments: 0
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedDep, setSelectedDep] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal uchun statelar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const pageSize = 8;

  const fetchData = async () => {
    try {
      setLoading(true);
      // Backend: /api/v1/users/employees/ endi testlarni ham qaytaradi
      const [mgrs, emps, exms, deps] = await Promise.all([
        apiFetch('/users/managers/'),
        apiFetch('/users/employees/'),
        apiFetch('/exams/'),
        apiFetch('/departments/')
      ]);

      setStats({
        managers: Array.isArray(mgrs) ? mgrs.length : 0,
        employees: Array.isArray(emps) ? emps.length : 0,
        exams: Array.isArray(exms) ? exms.length : 0,
        departments: Array.isArray(deps) ? deps.length : 0
      });
      setEmployees(emps || []);
      setDepartments(deps || []);
    } catch (error) {
      toast.error("Ma'lumotlarni yangilashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (record: any) => {
    setSelectedUser(record);
    setIsModalOpen(true);
  };

  const filteredEmployees = employees.filter((emp: any) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchText.toLowerCase()) ||
      emp.username?.toLowerCase().includes(searchText.toLowerCase());

    const matchesDep = selectedDep ? emp.department === selectedDep : true;
    return matchesSearch && matchesDep;
  });

  const statCards = [
    { title: 'Jami Managerlar', value: stats.managers, icon: <TeamOutlined />, color: '#3b82f6' },
    { title: 'Foydalanuvchilar', value: stats.employees, icon: <UserOutlined />, color: '#10b981' },
    { title: 'Jami Testlar', value: stats.exams, icon: <FileTextOutlined />, color: '#f59e0b' },
    { title: 'Bo\'limlar', value: stats.departments, icon: <ApartmentOutlined />, color: '#8b5cf6' },
  ];

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: 'Foydalanuvchi',
      key: 'full_name',
      render: (r: any) => (
        <Space>
          <Avatar className="bg-blue-500/10 text-blue-500 border-none" icon={<UserOutlined />} />
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">{`${r.first_name} ${r.last_name}`}</span>
            <span className="text-slate-500 text-[11px]">@{r.username}</span>
          </div>
        </Space>
      )
    },
    {
      title: 'Bo\'lim',
      dataIndex: 'department_name',
      render: (text: string) => <Tag className="rounded-full border-none bg-blue-500/10 text-blue-400 px-3">{text || 'Biriktirilmagan'}</Tag>
    },
    {
      title: 'Test Holati',
      key: 'exam_status',
      render: (r: any) => {
        const hasExams = r.exams && r.exams.length > 0;
        return (
          <span className={`${hasExams ? 'text-emerald-400' : 'text-amber-400'} text-[11px] font-bold uppercase tracking-wider`}>
            {hasExams ? `${r.exams.length} ta test topshirgan` : 'Test kutilmoqda'}
          </span>
        );
      }
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 100,
      render: (r: any) => (
        <Button
          type="text"
          icon={<EyeOutlined className="text-blue-400" />}
          className="hover:bg-blue-500/10 text-blue-400 text-xs"
          onClick={() => handleOpenModal(r)}
        >
          Ko'rish
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Statistika Kartalari */}
      <Row gutter={[24, 24]}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <div className="bg-[#1e293b]/40 border border-slate-800/60 p-6 rounded-2xl hover:border-slate-700 transition-all group shadow-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[2px]">{card.title}</p>
                  <h2 className="text-4xl font-black text-white group-hover:scale-105 transition-transform">
                    {loading ? '...' : card.value}
                  </h2>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                  style={{ backgroundColor: `${card.color}10`, color: card.color, boxShadow: `0 10px 20px -10px ${card.color}40` }}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Qidiruv va Filtrlar */}
      <div className="bg-[#1e293b]/20 p-5 rounded-[28px] border border-slate-800/40 flex flex-wrap gap-4 items-center justify-between backdrop-blur-md">
        <Space wrap size="middle">
          <Input
            placeholder="Ism yoki username orqali qidirish..."
            prefix={<SearchOutlined className="text-slate-500" />}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            className="w-80 h-12 bg-[#0f172a] border-slate-700 text-white rounded-2xl hover:border-blue-500 focus:border-blue-500 shadow-inner"
          />
          <Select
            placeholder="Barcha bo'limlar"
            className="w-56 h-12 custom-dark-select"
            allowClear
            onChange={(val) => { setSelectedDep(val); setCurrentPage(1); }}
          >
            {departments.map((dep: any) => (
              <Option key={dep.id} value={dep.id}>{dep.name}</Option>
            ))}
          </Select>
        </Space>

        <div className="text-slate-500 text-xs font-medium bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
          Jami topildi: <span className="text-blue-400 font-bold">{filteredEmployees.length} ta xodim</span>
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-[#0f172a]/80 rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl backdrop-blur-sm">
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          loading={loading}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleOpenModal(record),
            className: "cursor-pointer hover:bg-blue-500/5"
          })}
          pagination={{
            pageSize: pageSize,
            current: currentPage,
            onChange: (page) => setCurrentPage(page),
            className: "p-6",
            showSizeChanger: false
          }}
          className="custom-dark-table"
        />
      </div>

      {/* --- FOYDALANUVCHI MA'LUMOTLARI MODALI --- */}
      <Modal
        title={<span className="text-white text-xl font-bold">Xodim natijalari</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        centered
        className="custom-modal-dark"
        bodyStyle={{ backgroundColor: '#0f172a', padding: '24px' }}
      >
        <div className="space-y-6">
          {/* Xodim profili Header */}
          <div className="flex items-center gap-5 p-5 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-inner">
            <Avatar size={70} icon={<UserOutlined />} className="bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20" />
            <div>
              <h3 className="text-white text-xl font-bold m-0">
                {selectedUser?.first_name} {selectedUser?.last_name}
              </h3>
              <p className="text-slate-500 m-0 font-medium">@{selectedUser?.username}</p>
              <div className="flex gap-2 mt-2">
                <Tag color="blue" className="border-none bg-blue-500/20 text-blue-400 font-bold px-3">
                  {selectedUser?.department_name || 'Bo\'limsiz'}
                </Tag>
                <Tag color="purple" className="border-none bg-purple-500/20 text-purple-400 px-3 italic">
                  Manager: {selectedUser?.manager_name || 'Tayinlanmagan'}
                </Tag>
              </div>
            </div>
          </div>

          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] flex items-center gap-2">
            <FileTextOutlined className="text-blue-500" /> Topshirilgan testlar ro'yxati
          </h4>

          {/* Testlar Ro'yxati Skrollanadigan qism */}
          <div className="max-h-[450px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {selectedUser?.exams && selectedUser.exams.length > 0 ? (
              selectedUser.exams.map((exam: any, idx: number) => (
                <div key={idx} className="p-6 bg-[#1e293b]/40 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="z-10">
                      <h5 className="text-white font-bold text-lg m-0 group-hover:text-blue-400 transition-colors">{exam.title}</h5>
                      <p className="text-slate-500 text-xs mt-1">Topshirilgan sana: {exam.date || 'Aniq emas'}</p>
                    </div>
                    <Tag
                      className="rounded-full border-none px-4 py-1 font-black text-[10px] uppercase tracking-tighter shadow-sm"
                      color={exam.score >= 35 ? "success" : "error"}
                    >
                      {exam.score >= 35 ? "Muvaffaqiyatli" : "Yiqildi"}
                    </Tag>
                  </div>

                  {/* Ko'rsatkichlar Paneli */}
                  <Row gutter={16} className="relative z-10">
                    <Col span={8}>
                      <div className="text-center p-4 bg-slate-900/60 rounded-2xl border border-slate-800/50">
                        <CheckCircleOutlined className="text-emerald-500 text-xl mb-2" />
                        <div className="text-white text-lg font-black">{exam.correct_count}</div>
                        <div className="text-slate-500 text-[9px] font-bold uppercase">To'g'ri</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="text-center p-4 bg-slate-900/60 rounded-2xl border border-slate-800/50">
                        <CloseCircleOutlined className="text-red-500 text-xl mb-2" />
                        <div className="text-white text-lg font-black">{exam.wrong_count}</div>
                        <div className="text-slate-500 text-[9px] font-bold uppercase">Xato</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="text-center p-4 bg-slate-900/60 rounded-2xl border border-slate-800/50">
                        <InfoCircleOutlined className="text-blue-500 text-xl mb-2" />
                        <div className="text-white text-lg font-black">{exam.score}%</div>
                        <div className="text-slate-500 text-[9px] font-bold uppercase">Umumiy Ball</div>
                      </div>
                    </Col>
                  </Row>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between items-end mb-2 px-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">O'zlashtirish darajasi</span>
                      <span className={`text-sm font-black ${exam.score >= 35 ? 'text-emerald-400' : 'text-red-400'}`}>{exam.score}%</span>
                    </div>
                    <Progress
                      percent={exam.score}
                      showInfo={false}
                      strokeColor={{ '0%': '#3b82f6', '100%': '#10b981' }}
                      trailColor="#0f172a"
                      strokeWidth={8}
                      className="m-0"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
                <div className="text-slate-600 text-4xl mb-4"><FileTextOutlined /></div>
                <p className="text-slate-500 font-medium">Ushbu foydalanuvchi hali birorta ham test topshirmagan.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomeSection;