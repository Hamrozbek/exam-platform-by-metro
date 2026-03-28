import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Table, Space, Tag, Avatar, Modal, Button } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  SearchOutlined,
  EyeOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';

const { Option } = Select;

const HomeSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ managers: 0, employees: 0, exams: 0, departments: 0 });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedDep, setSelectedDep] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const pageSize = 8;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mgrsData, empsData, exmsData, depsData, resData] = await Promise.all([
        apiFetch('/users/managers/'),
        apiFetch('/users/employees/'),
        apiFetch('/exams/'),
        apiFetch('/departments/'),
        apiFetch('/results/all/'),
      ]);

      const mgrs = mgrsData?.results || (Array.isArray(mgrsData) ? mgrsData : []);
      const empsList = empsData?.results || (Array.isArray(empsData) ? empsData : []);
      const exms = exmsData?.results || (Array.isArray(exmsData) ? exmsData : []);
      const deps = depsData?.results || (Array.isArray(depsData) ? depsData : []);
      const resList = resData?.results || (Array.isArray(resData) ? resData : []);

      setStats({
        managers: mgrs.length,
        employees: empsList.length,
        exams: exms.length,
        departments: deps.length,
      });

      // Combine data for better frontend handling
      const processedEmployees = empsList.map((emp: any) => {
        const userExams = resList.filter((r: any) => r?.user?.username === emp.username).map((r: any) => ({
          title: r?.exam?.title || '_',
          date: r?.start_time ? new Date(r.start_time).toLocaleString() : '_',
          score: r?.total_questions ? Math.round((r.correct_answers / r.total_questions) * 100) : 0,
          correct: r.correct_answers,
          wrong: r.wrong_answers,
          is_passed: r.is_passed
        }));

        // Lookup department ID for filtering
        const depObj = deps.find((d: any) => d.name === emp.department);
        
        // Lookup manager for this department
        const mgrObj = mgrs.find((m: any) => m.department === emp.department);
        const managerName = mgrObj ? `${mgrObj.first_name} ${mgrObj.last_name}`.trim() : 'Tayinlanmagan';

        return { 
          ...emp, 
          exams: userExams,
          department_id: depObj?.id || null,
          department_name: emp.department || 'Bo\'limsiz',
          manager_name: managerName
        };
      });

      setEmployees(processedEmployees);
      setDepartments(deps);
    } catch {
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
    const matchesDep = selectedDep ? emp.department_id === selectedDep : true;
    return matchesSearch && matchesDep;
  });

  const statCards = [
    { title: 'Jami Managerlar', value: stats.managers, icon: <TeamOutlined />, color: '#3b82f6' },
    { title: 'Foydalanuvchilar', value: stats.employees, icon: <UserOutlined />, color: '#10b981' },
    { title: 'Jami Testlar', value: stats.exams, icon: <FileTextOutlined />, color: '#f59e0b' },
    { title: "Bo'limlar", value: stats.departments, icon: <ApartmentOutlined />, color: '#8b5cf6' },
  ];

  // Mobile card view for employees
  const MobileCard = ({ record }: { record: any; index: number }) => (
    <div
      className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3 cursor-pointer hover:border-blue-500/40 transition-all"
      onClick={() => handleOpenModal(record)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-500/10 text-blue-500 border-none shrink-0" icon={<UserOutlined />} />
          <div>
            <p className="text-white font-medium text-sm m-0">{`${record.first_name} ${record.last_name}`}</p>
            <p className="text-slate-500 text-xs m-0">@{record.username}</p>
          </div>
        </div>
        <EyeOutlined className="text-blue-400 text-base" />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <Tag className="rounded-full border-none bg-blue-500/10 text-blue-400 px-3 text-xs">
          {record.department_name || 'Biriktirilmagan'}
        </Tag>
        <span className={`text-[10px] font-bold uppercase tracking-wider self-center ${record.exams?.length > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {record.exams?.length > 0 ? `${record.exams.length} ta test` : 'Test kutilmoqda'}
        </span>
      </div>
    </div>
  );

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
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
      ),
    },
    {
      title: "Bo'lim",
      dataIndex: 'department_name',
      responsive: ['md'] as any,
      render: (text: string) => (
        <Tag className="rounded-full border-none bg-blue-500/10 text-blue-400 px-3">
          {text || 'Biriktirilmagan'}
        </Tag>
      ),
    },
    {
      title: 'Test Holati',
      key: 'exam_status',
      responsive: ['sm'] as any,
      render: (r: any) => {
        const hasExams = r.exams && r.exams.length > 0;
        return (
          <span className={`${hasExams ? 'text-emerald-400' : 'text-amber-400'} text-[11px] font-bold uppercase tracking-wider`}>
            {hasExams ? `${r.exams.length} ta test` : 'Kutilmoqda'}
          </span>
        );
      },
    },
    {
      title: 'Amal',
      key: 'actions',
      width: 90,
      render: (r: any) => (
        <Button
          type="text"
          icon={<EyeOutlined className="text-blue-400" />}
          className="hover:bg-blue-500/10 text-blue-400 text-xs"
          onClick={(e) => { e.stopPropagation(); handleOpenModal(r); }}
        >
          <span className="hidden sm:inline">Ko'rish</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-700">

      {/* Statistika Kartalari */}
      <Row gutter={[12, 12]}>
        {statCards.map((card, index) => (
          <Col xs={12} sm={12} lg={6} key={index}>
            <div className="bg-[#1e293b]/40 border border-slate-800/60 p-4 sm:p-6 rounded-2xl hover:border-slate-700 transition-all group shadow-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] truncate">
                    {card.title}
                  </p>
                  <h2 className="text-2xl sm:text-4xl font-black text-white group-hover:scale-105 transition-transform">
                    {loading ? '...' : card.value}
                  </h2>
                </div>
                <div
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl shadow-lg shrink-0"
                  style={{
                    backgroundColor: `${card.color}10`,
                    color: card.color,
                    boxShadow: `0 10px 20px -10px ${card.color}40`,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Qidiruv va Filtrlar */}
      <div className="bg-[#1e293b]/20 p-4 sm:p-5 rounded-[20px] sm:rounded-[28px] border border-slate-800/40 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Ism yoki username..."
            prefix={<SearchOutlined className="text-slate-500" />}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-72 h-10 sm:h-12 bg-[#0f172a] border-slate-700 text-white rounded-xl sm:rounded-2xl hover:border-blue-500 focus:border-blue-500"
          />
          <Select
            placeholder="Barcha bo'limlar"
            className="w-full sm:w-52 h-10 sm:h-12 custom-dark-select"
            allowClear
            onChange={(val) => { setSelectedDep(val); setCurrentPage(1); }}
          >
            {departments.map((dep: any) => (
              <Option key={dep.id} value={dep.id}>{dep.name}</Option>
            ))}
          </Select>
        </div>
        <div className="text-slate-500 text-xs font-medium bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 self-start sm:self-auto whitespace-nowrap">
          Topildi: <span className="text-blue-400 font-bold">{filteredEmployees.length} ta</span>
        </div>
      </div>

      {/* Jadval — Desktop | Kartalar — Mobile */}
      {isMobile ? (
        <div>
          {filteredEmployees.length === 0 && !loading ? (
            <div className="text-center py-12 text-slate-500">Ma'lumot topilmadi</div>
          ) : (
            filteredEmployees
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((emp: any, idx: number) => (
                <MobileCard key={emp.id} record={emp} index={idx} />
              ))
          )}
          {/* Simple pagination for mobile */}
          {filteredEmployees.length > pageSize && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="text-slate-400 border-slate-700"
              >← Oldingi</Button>
              <span className="text-slate-500 text-sm self-center px-2">
                {currentPage} / {Math.ceil(filteredEmployees.length / pageSize)}
              </span>
              <Button
                size="small"
                disabled={currentPage >= Math.ceil(filteredEmployees.length / pageSize)}
                onClick={() => setCurrentPage(p => p + 1)}
                className="text-slate-400 border-slate-700"
              >Keyingi →</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0f172a]/80 rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl backdrop-blur-sm">
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            loading={loading}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => handleOpenModal(record),
              className: 'cursor-pointer hover:bg-blue-500/5',
            })}
            pagination={{
              pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
              className: 'p-6',
              showSizeChanger: false,
            }}
            className="custom-dark-table"
            scroll={{ x: 600 }}
          />
        </div>
      )}

      {/* Xodim ma'lumotlari Modali */}
      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="95%"
        style={{ maxWidth: 700 }}
        centered
        closeIcon={null}
        modalRender={(modal) => (
          <div className="bg-[#0b1120] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl">
            {modal}
          </div>
        )}
      >
        {selectedUser && (
          <div className="p-6 sm:p-8">
            {/* Header: Profil rasmi va ism-sharif */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                <Avatar
                  size={70}
                  className="bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-slate-800 shadow-xl flex items-center justify-center text-2xl"
                  icon={<UserOutlined />}
                />
                <div>
                  <h2 className="text-white text-xl font-bold m-0 tracking-tight">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="bg-blue-500/10 border-none text-blue-400 m-0 px-2 rounded-md font-mono text-[11px]">
                      Xodim (User)
                    </Tag>
                    <span className="text-slate-500 text-xs">ID: {selectedUser.id}</span>
                  </div>
                </div>
              </div>
              <Button
                type="text"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full"
              >✕</Button>
            </div>

            {/* KIRISH MA'LUMOTLARI (LOGIN & PAROL) */}
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 p-5 rounded-3xl border border-blue-500/20 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <LockOutlined className="text-blue-400 text-xs" />
                </div>
                <span className="text-blue-400 text-[10px] font-black uppercase tracking-[2px]">Tizimga kirish</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-slate-500 text-[9px] font-bold uppercase pl-1">Login (Username)</p>
                  <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
                    <code className="text-blue-400 font-mono text-sm">{selectedUser.username}</code>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 text-[9px] font-bold uppercase pl-1">Parol</p>
                  <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
                    <code className="text-emerald-400 font-mono text-sm">
                      {selectedUser.password ?? "—"}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* ASOSIY MA'LUMOTLAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-blue-400 text-lg mb-1"><ApartmentOutlined /></span>
                <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Bo'lim</span>
                <span className="text-slate-200 text-sm font-medium">{selectedUser.department_name || 'Biriktirilmagan'}</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-purple-400 text-lg mb-1"><TeamOutlined /></span>
                <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Manager (Boshliq)</span>
                <span className="text-slate-200 text-sm font-medium">{selectedUser.manager_name || 'Tayinlanmagan'}</span>
              </div>
            </div>

            {/* TEST NATIJALARI SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <FileTextOutlined className="text-blue-500" /> Topshirilgan testlar
                </h3>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                  Jami: {selectedUser.exams?.length || 0} ta
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {selectedUser.exams && selectedUser.exams.length > 0 ? (
                  selectedUser.exams.map((exam: any, idx: number) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-800/50 p-4 rounded-2xl hover:border-slate-700 transition-all group">
                      <div className="flex justify-between items-center">
                        <div className="min-w-0">
                          <h4 className="text-slate-200 font-bold text-sm m-0 truncate group-hover:text-blue-400 transition-colors">{exam.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="text-slate-500 text-[10px] m-0">{exam.date || '_'}</p>
                             <span className="text-slate-600 text-[10px]">•</span>
                             <span className="text-slate-500 text-[10px]">{exam.correct} to'g'ri / {exam.wrong} xato</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-sm font-black ${exam.is_passed ? 'text-emerald-400' : 'text-red-400'}`}>
                            {exam.score}%
                          </span>
                          <Tag
                            color={exam.is_passed ? 'success' : 'error'}
                            className="m-0 border-none text-[9px] px-2 py-0 rounded-full font-bold uppercase"
                          >
                            {exam.is_passed ? 'O\'tdi' : 'Yiqildi'}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <p className="text-slate-600 italic text-xs m-0">Hali test topshirilmagan</p>
                  </div>
                )}
              </div>
            </div>

            <Button
              block
              onClick={() => setIsModalOpen(false)}
              className="mt-8 h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold transition-all"
            >
              Yopish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomeSection;