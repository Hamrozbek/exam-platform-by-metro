import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Avatar, Modal, Tooltip } from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    EyeOutlined,
    LockOutlined,
    FileExcelOutlined,
    ApartmentOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api'; // API import qilindi
import { toast } from 'sonner';

const MyEmployees: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]); // Bo'sh array bilan boshlanadi
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const pageSize = 10;

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- BACKEND ULANISH QISMI ---
    // --- BACKEND ULANISH QISMI ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/users/employees/');

            // 🔥 MANA SHU YERDA KONSOLGA CHIQARAMIZ
            console.log("🔥 MY EMPLOYEES DATA:", data);

            if (data && data.results) {
                setEmployees(data.results || []);
            } else if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            toast.error("Xodimlarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Xavfsiz qidiruv (Optional chaining ishlatildi)
    const filtered = employees.filter((emp: any) =>
        (emp?.first_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (emp?.last_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (emp?.username || '').toLowerCase().includes(searchText.toLowerCase())
    );

    // --- MOBILE CARD ---
    const MobileCard = ({ record }: { record: any }) => (
        <div className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="bg-blue-500/10 text-blue-500 shrink-0" icon={<UserOutlined />} />
                    <div className="min-w-0">
                        <p className="text-white font-medium text-sm m-0 truncate">
                            {record?.first_name || '_'} {record?.last_name || '_'}
                        </p>
                        <p className="text-slate-500 text-xs m-0">@{record?.username || '_'}</p>
                    </div>
                </div>
                <div className="flex gap-1 shrink-0">
                    <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined className="text-blue-400" />}
                        onClick={() => { setSelectedUser(record); setIsModalOpen(true); }}
                        className="hover:bg-blue-500/10 rounded-lg"
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 items-center justify-between border-t border-slate-800/50 pt-3">
                <Tag color="blue" className="bg-blue-500/10 border-none px-3 text-[11px] rounded-full m-0">
                    {record?.department_name || record?.department || '_'}
                </Tag>
                {record?.assigned_exam ? (
                    <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                        <FileExcelOutlined className="text-xs" />
                        {record.assigned_exam}
                    </span>
                ) : (
                    <span className="text-amber-400 text-[10px] font-medium uppercase tracking-wider">Test yo'q</span>
                )}
            </div>
        </div>
    );

    const columns = [
        {
            title: '#',
            width: 50,
            render: (_: any, __: any, index: number) => <span className="text-slate-400">{(currentPage - 1) * pageSize + index + 1}</span>,
        },
        {
            title: 'Foydalanuvchi',
            key: 'user',
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
                <Tag color="blue" className="bg-blue-500/10 border-none px-3 text-[11px] font-medium">
                    {r?.department_name || r?.department || '_'}
                </Tag>
            ),
        },
        {
            title: 'Biriktirilgan Test',
            dataIndex: 'assigned_exam',
            responsive: ['lg'] as any,
            render: (exam: string) => (
                exam ? (
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center">
                        <FileExcelOutlined className="mr-2" />
                        {exam}
                    </span>
                ) : (
                    <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Mavjud emas</span>
                )
            ),
        },
        {
            title: 'Tel',
            dataIndex: 'phone_number',
            responsive: ['sm'] as any,
            render: (p: string) => <span className="text-slate-400 font-mono text-[11px]">{p || '—'}</span>,
        },
        {
            title: 'Amal',
            key: 'actions',
            width: 80,
            align: 'center' as const,
            render: (r: any) => (
                <Tooltip title="Ma'lumotlarni ko'rish">
                    <Button
                        type="text"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                        icon={<EyeOutlined />}
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(r); setIsModalOpen(true); }}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="p-2 sm:p-3 space-y-4 sm:space-y-6 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <Input
                    placeholder="Xodimlaringizni qidirish..."
                    prefix={<SearchOutlined className="text-slate-500" />}
                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                    className="w-full sm:w-80 h-11 sm:h-12 bg-slate-900 border-slate-800 text-white rounded-2xl hover:border-blue-500 focus:border-blue-500 shadow-inner"
                />
                <div className="text-slate-500 text-xs font-medium bg-slate-900/50 px-4 py-2.5 rounded-full border border-slate-800 self-start sm:self-auto">
                    Sizning xodimlaringiz: <span className="text-blue-400 font-bold">{filtered.length} ta</span>
                </div>
            </div>

            {/* Jadval / Mobile kartalar */}
            {isMobile ? (
                <div>
                    {filtered.length === 0 && !loading ? (
                        <div className="text-center py-12 text-slate-500 text-sm bg-slate-900/20 rounded-[20px] border border-dashed border-slate-800">Xodim topilmadi</div>
                    ) : (
                        filtered
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map((emp: any) => <MobileCard key={emp.id} record={emp} />)
                    )}
                    {filtered.length > pageSize && (
                        <div className="flex justify-center gap-2 mt-4">
                            <Button
                                size="small"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="text-slate-400 border-slate-700 bg-transparent"
                            >← Oldingi</Button>
                            <span className="text-slate-500 text-sm self-center px-2">
                                {currentPage} / {Math.ceil(filtered.length / pageSize)}
                            </span>
                            <Button
                                size="small"
                                disabled={currentPage >= Math.ceil(filtered.length / pageSize)}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="text-slate-400 border-slate-700 bg-transparent"
                            >Keyingi →</Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-[#0f172a]/80 border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                    <Table
                        columns={columns}
                        dataSource={filtered}
                        loading={loading}
                        rowKey="id"
                        onRow={(record) => ({
                            onClick: () => { setSelectedUser(record); setIsModalOpen(true); },
                            className: 'cursor-pointer hover:bg-blue-500/5 transition-colors',
                        })}
                        pagination={{
                            current: currentPage,
                            pageSize,
                            onChange: (page) => setCurrentPage(page),
                            className: 'p-4',
                            showSizeChanger: false,
                        }}
                        className="custom-dark-table"
                        scroll={{ x: 500 }}
                    />
                </div>
            )}

            {/* Xodim detallari Modali */}
            <Modal
                title={null}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                closeIcon={null}
                width="95%"
                style={{ maxWidth: 450 }}
                modalRender={(modal) => (
                    <div className="bg-[#0f172a] border border-slate-800 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {modal}
                    </div>
                )}
            >
                {selectedUser && (
                    <div className="p-5 sm:p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-5 sm:mb-6 gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <Avatar
                                    size={isMobile ? 52 : 64}
                                    className="bg-blue-600 text-white shrink-0"
                                    icon={<UserOutlined />}
                                />
                                <div className="min-w-0">
                                    <h3 className="text-white text-lg sm:text-xl font-bold m-0 truncate">
                                        {selectedUser?.first_name || '_'} {selectedUser?.last_name || '_'}
                                    </h3>
                                    <p className="text-slate-500 m-0 text-sm">@{selectedUser?.username || '_'}</p>
                                </div>
                            </div>
                            <Button
                                type="text"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full shrink-0 flex items-center justify-center"
                            >✕</Button>
                        </div>

                        {/* Login Card */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-blue-500/20 mb-4 sm:mb-6 shadow-inner">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <LockOutlined className="text-blue-500" />
                                <span className="text-blue-400 text-[11px] font-bold uppercase tracking-widest">
                                    Kirish ma'lumotlari
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                                    <span className="text-slate-500 text-[10px] uppercase font-bold px-2 shrink-0">Login</span>
                                    <code className="text-blue-400 font-mono text-sm font-bold border-slate-800 truncate pr-2">
                                        {selectedUser?.username || '_'}
                                    </code>
                                </div>
                                <div className="flex justify-between items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                                    <span className="text-slate-500 text-[10px] uppercase font-bold px-2 shrink-0">Parol</span>
                                    <code className="text-emerald-400 font-mono text-sm font-bold border-slate-800 truncate pr-2">
                                        {selectedUser?.password || '—'}
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 m-0 flex items-center gap-1.5"><ApartmentOutlined className="text-blue-500" /> Bo'lim</p>
                                <p className="text-slate-200 text-xs sm:text-sm font-medium truncate m-0">
                                    {selectedUser?.department_name || selectedUser?.department || '_'}
                                </p>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 m-0">Telefon</p>
                                <p className="text-slate-200 text-xs sm:text-sm font-medium m-0">
                                    {selectedUser?.phone_number || '—'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-3 sm:p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
                            <div className="min-w-0">
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 m-0">Biriktirilgan test</p>
                                <p className="text-amber-500 text-xs sm:text-sm font-bold m-0 truncate">
                                    {selectedUser?.assigned_exam || 'Mavjud emas'}
                                </p>
                            </div>
                            <FileExcelOutlined className="text-xl sm:text-2xl text-slate-700 shrink-0" />
                        </div>

                        <Button
                            block
                            className="mt-4 sm:mt-6 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold transition-all shadow-md"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Yopish
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyEmployees;