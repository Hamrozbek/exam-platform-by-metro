import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Table, Space, Tag, Avatar, Modal, Button } from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    FileTextOutlined,
    SearchOutlined,
    EyeOutlined,
    LineChartOutlined,
    ApartmentOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

const ManagerHomeSection: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [stats, setStats] = useState({ employees: 0, averageScore: 0, activeExams: 0 });

    const [searchText, setSearchText] = useState('');
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

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [empsData, resData] = await Promise.all([
                apiFetch('/users/employees/'),
                apiFetch('/results/all/')
            ]);

            const empList = empsData?.results || (Array.isArray(empsData) ? empsData : []);
            const resList = resData?.results || (Array.isArray(resData) ? resData : []);

            console.log("🔥 MANAGER EMPLOYEES:", empList);
            console.log("🔥 MANAGER RESULTS:", resList);

            // Combine employees with their exams
            const processedEmployees = empList.map((emp: any) => {
                const userExams = resList.filter((r: any) => r?.user?.username === emp.username).map((r: any) => ({
                    title: r?.exam?.title || '_',
                    date: r?.start_time ? new Date(r.start_time).toLocaleString() : '_',
                    score: r?.total_questions ? Math.round((r.correct_answers / r.total_questions) * 100) : 0,
                    correct: r.correct_answers,
                    wrong: r.wrong_answers,
                    is_passed: r.is_passed
                }));
                return { ...emp, exams: userExams };
            });

            setEmployees(processedEmployees);

            let totalScore = 0;
            let activeExamsCount = 0;
            
            resList.forEach((r: any) => {
                const score = r?.total_questions ? Math.round((r.correct_answers / r.total_questions) * 100) : 0;
                totalScore += score;
                activeExamsCount++;
            });

            setStats({
                employees: empList.length,
                averageScore: activeExamsCount > 0 ? Math.round(totalScore / activeExamsCount) : 0,
                activeExams: empList.filter((e: any) => e.assigned_exam && e.assigned_exam !== "Test biriktirilmagan").length
            });

        } catch (error) {
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenModal = (record: any) => {
        setSelectedUser(record);
        setIsModalOpen(true);
    };

    // Xato bermasligi uchun optional chaining (?.) va fallback ('') ishlatildi
    const filteredEmployees = employees.filter((emp: any) => {
        const fullName = `${emp?.first_name || ''} ${emp?.last_name || ''}`.toLowerCase();
        return fullName.includes(searchText.toLowerCase()) || (emp?.username || '').toLowerCase().includes(searchText.toLowerCase());
    });

    const statCards = [
        { title: 'Xodimlar Soni', value: stats.employees || 0, icon: <TeamOutlined />, color: '#3b82f6' },
        { title: "O'rtacha Natija", value: `${stats.averageScore || 0}%`, icon: <LineChartOutlined />, color: '#10b981' },
        { title: 'Faol Testlar', value: stats.activeExams || 0, icon: <FileTextOutlined />, color: '#8b5cf6' },
    ];

    // Mobil uchun Card
    const MobileCard = ({ record }: { record: any }) => {
        const hasExams = record?.exams && record.exams.length > 0;
        return (
            <div
                className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3 cursor-pointer hover:border-blue-500/40 transition-all shadow-md"
                onClick={() => handleOpenModal(record)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="bg-blue-500/10 text-blue-500 border-none shrink-0" icon={<UserOutlined />} />
                        <div>
                            <p className="text-white font-medium text-sm m-0">{`${record?.first_name || '_'} ${record?.last_name || '_'}`}</p>
                            <p className="text-slate-500 text-xs m-0">@{record?.username || '_'}</p>
                        </div>
                    </div>
                    <EyeOutlined className="text-blue-400 text-base" />
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
                    <Tag className="rounded-full border-none bg-slate-800 text-slate-300 px-3 m-0 text-xs font-medium">
                        {record?.department_name || record?.department || '_'}
                    </Tag>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${hasExams ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {hasExams ? `${record.exams.length} ta test` : 'Kutilmoqda'}
                    </span>
                </div>
            </div>
        );
    };

    // Desktop uchun Jadval ustunlari
    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_: any, __: any, index: number) => <span className="text-slate-400">{(currentPage - 1) * pageSize + index + 1}</span>,
        },
        {
            title: 'Foydalanuvchi',
            key: 'full_name',
            render: (r: any) => (
                <Space>
                    <Avatar className="bg-blue-500/10 text-blue-500 border-none" icon={<UserOutlined />} />
                    <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{`${r?.first_name || '_'} ${r?.last_name || '_'}`}</span>
                        <span className="text-slate-500 text-[11px]">@{r?.username || '_'}</span>
                    </div>
                </Space>
            ),
        },
        {
            title: "Bo'lim",
            key: 'department',
            responsive: ['md'] as any,
            render: (r: any) => (
                <Tag className="rounded-full border-none bg-slate-800 text-slate-300 px-3 font-medium m-0">
                    {r?.department_name || r?.department || '_'}
                </Tag>
            ),
        },
        {
            title: 'Test Holati',
            key: 'exam_status',
            responsive: ['sm'] as any,
            render: (r: any) => {
                const hasExams = r?.exams && r.exams.length > 0;
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
            width: 100,
            align: 'center' as const,
            render: (r: any) => (
                <Button
                    type="text"
                    icon={<EyeOutlined className="text-blue-400" />}
                    className="hover:bg-blue-500/10 text-blue-400 text-xs font-medium"
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(r); }}
                >
                    <span className="hidden sm:inline">Ko'rish</span>
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-700">

            {/* 1. Statistika Kartalari */}
            <Row gutter={[12, 12]}>
                {statCards.map((card, index) => (
                    <Col xs={24} sm={8} lg={8} key={index}>
                        <div className="bg-[#1e293b]/40 border border-slate-800/60 p-5 sm:p-6 rounded-3xl hover:border-slate-700 transition-all group shadow-lg flex justify-between items-center backdrop-blur-sm">
                            <div className="space-y-1 min-w-0">
                                <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[1.5px] truncate m-0">
                                    {card.title}
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-black text-white group-hover:scale-105 transition-transform m-0 mt-1">
                                    {loading ? '...' : card.value}
                                </h2>
                            </div>
                            <div
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0"
                                style={{ backgroundColor: `${card.color}15`, color: card.color, boxShadow: `0 10px 20px -10px ${card.color}40` }}
                            >
                                {card.icon}
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* 2. Qidiruv paneli */}
            <div className="bg-[#1e293b]/20 p-4 sm:p-5 rounded-[20px] sm:rounded-[28px] border border-slate-800/40 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between backdrop-blur-md">
                <Input
                    placeholder="Ism yoki username orqali qidirish..."
                    prefix={<SearchOutlined className="text-slate-500" />}
                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                    className="w-full sm:w-96 h-12 bg-[#0f172a] border-slate-700 text-white rounded-2xl hover:border-blue-500 focus:border-blue-500 shadow-inner"
                />
                <div className="text-slate-500 text-xs font-medium bg-slate-900/50 px-5 py-3 rounded-full border border-slate-800 self-start sm:self-auto whitespace-nowrap">
                    Sizning xodimlaringiz: <span className="text-blue-400 font-bold">{filteredEmployees.length} ta</span>
                </div>
            </div>

            {/* 3. Jadval — Desktop | Kartalar — Mobile */}
            {isMobile ? (
                <div>
                    {filteredEmployees.length === 0 && !loading ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900/20 rounded-[20px] border border-dashed border-slate-800">Ma'lumot topilmadi</div>
                    ) : (
                        filteredEmployees
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map((emp: any, _idx: number) => (
                                <MobileCard key={emp.id} record={emp} />
                            ))
                    )}
                    {filteredEmployees.length > pageSize && (
                        <div className="flex justify-center gap-2 mt-4">
                            <Button size="small" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="text-slate-400 border-slate-700 bg-transparent">← Oldingi</Button>
                            <span className="text-slate-500 text-sm self-center px-2">{currentPage} / {Math.ceil(filteredEmployees.length / pageSize)}</span>
                            <Button size="small" disabled={currentPage >= Math.ceil(filteredEmployees.length / pageSize)} onClick={() => setCurrentPage(p => p + 1)} className="text-slate-400 border-slate-700 bg-transparent">Keyingi →</Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-[#0f172a]/80 rounded-[24px] overflow-hidden border border-slate-800/50 shadow-2xl backdrop-blur-sm">
                    <Table
                        columns={columns}
                        dataSource={filteredEmployees}
                        loading={loading}
                        rowKey="id"
                        onRow={(record) => ({
                            onClick: () => handleOpenModal(record),
                            className: 'cursor-pointer hover:bg-blue-500/5 transition-colors',
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

            {/* 4. MODAL */}
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
                    <div className="bg-[#0b1120] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
                        {modal}
                    </div>
                )}
            >
                {selectedUser && (
                    <div className="p-6 sm:p-8">

                        {/* Header: Profil rasmi va ism */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-5">
                                <Avatar
                                    size={70}
                                    className="bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-slate-800 shadow-xl flex items-center justify-center text-2xl"
                                    icon={<UserOutlined />}
                                />
                                <div>
                                    <h2 className="text-white text-xl font-bold m-0 tracking-tight">
                                        {selectedUser?.first_name || '_'} {selectedUser?.last_name || '_'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Tag className="bg-blue-500/10 border-none text-blue-400 m-0 px-2 rounded-md font-mono text-[11px]">
                                            Xodim (User)
                                        </Tag>
                                        <span className="text-slate-500 text-xs">@{selectedUser?.username || '_'}</span>
                                    </div>
                                </div>
                            </div>
                            <Button type="text" onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8 flex items-center justify-center">✕</Button>
                        </div>

                        {/* Qisqacha Ma'lumot */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
                                <span className="text-blue-400 text-lg mb-1"><ApartmentOutlined /></span>
                                <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Bo'lim</span>
                                <span className="text-slate-200 text-sm font-medium">{selectedUser?.department_name || selectedUser?.department || '_'}</span>
                            </div>
                            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
                                <span className="text-emerald-400 text-lg mb-1"><LineChartOutlined /></span>
                                <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider">O'rtacha Ball</span>
                                <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                                    {selectedUser?.exams?.length ? 'Baho hisoblangan' : 'Kutilmoqda'}
                                </span>
                            </div>
                        </div>

                        {/* Test Natijalari (Scroll qismi) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 m-0">
                                    <FileTextOutlined className="text-blue-500" /> Topshirilgan testlar
                                </h3>
                                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                    Jami: {selectedUser?.exams?.length || 0} ta
                                </span>
                            </div>

                            <div className="max-h-56 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {selectedUser?.exams && selectedUser.exams.length > 0 ? (
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

                        <Button block onClick={() => setIsModalOpen(false)} className="mt-8 h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold transition-all">
                            Yopish
                        </Button>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default ManagerHomeSection;