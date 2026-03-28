import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, Modal, Form, Tag, Upload, Tooltip, Avatar } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SearchOutlined,
    ArrowLeftOutlined,
    CloudUploadOutlined,
    ExclamationCircleOutlined,
    InboxOutlined,
    FileExcelOutlined,
    UserOutlined,
    EyeOutlined,
    LockOutlined
} from '@ant-design/icons';
import { apiFetch, apiUpload } from '../../utils/api';
import { toast } from 'sonner';

const { Option } = Select;
const { Dragger } = Upload;

const UsersSection: React.FC = () => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [exams, setExams] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();
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

    const fetchData = async () => {
        try {
            setLoading(true);
            const [empData, exmData] = await Promise.all([
                apiFetch('/users/employees/'),
                apiFetch('/exams/'),
            ]);
            setEmployees(empData?.results || (Array.isArray(empData) ? empData : []));
            setExams(exmData?.results || (Array.isArray(exmData) ? exmData : []));
        } catch {
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const onFinish = async (values: any) => {
        if (fileList.length === 0) return toast.error("Iltimos, Excel faylni yuklang");

        const formData = new FormData();
        formData.append('exam_id', values.exam_id);
        const fileObj = fileList[0].originFileObj || fileList[0];
        formData.append('file', fileObj);

        try {
            setLoading(true);
            await apiUpload('/users/bulk-create-employees/', formData);
            toast.success("Xodimlar muvaffaqiyatli bazaga qo'shildi");
            setView('list');
            setFileList([]);
            form.resetFields();
            fetchData();
        } catch {
            toast.error("Faylni yuklashda xatolik! Ustunlar nomini tekshiring.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: <span className="text-white">Xodimni o'chirish</span>,
            icon: <ExclamationCircleOutlined className="text-red-500" />,
            content: <span className="text-slate-400">Ushbu amalni ortga qaytarib bo'lmaydi. Xodimning barcha natijalari ham o'chadi.</span>,
            okText: "O'chirish",
            okType: 'danger',
            centered: true,
            className: 'dark-confirm-modal',
            onOk: async () => {
                try {
                    await apiFetch(`/users/employees/${id}/delete/`, { method: 'DELETE' });
                    toast.success("Xodim o'chirildi");
                    fetchData();
                } catch {
                    toast.error("Xatolik: Xodimni o'chirib bo'lmadi");
                }
            },
        });
    };

    const filtered = employees.filter((emp: any) =>
        emp.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.username?.toLowerCase().includes(searchText.toLowerCase())
    );

    // --- MOBILE CARD ---
    const MobileCard = ({ record }: { record: any }) => (
        <div className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                        className="bg-blue-500/10 text-blue-500 shrink-0"
                        icon={<UserOutlined />}
                    />
                    <div className="min-w-0">
                        <p className="text-white font-medium text-sm m-0 truncate">
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
                        onClick={() => { setSelectedUser(record); setIsModalOpen(true); }}
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
            <div className="flex flex-wrap gap-2 mt-3">
                <Tag color="blue" className="bg-blue-500/10 border-none px-3 text-[11px] rounded-full m-0">
                    {record.department || 'N/A'}
                </Tag>
                {record.assigned_exam && (
                    <span className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
                        <FileExcelOutlined className="text-xs" />
                        {record.assigned_exam}
                    </span>
                )}
            </div>
        </div>
    );

    const columns = [
        {
            title: '#',
            width: 50,
            render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: 'Foydalanuvchi',
            key: 'user',
            render: (r: any) => (
                <Space>
                    <Avatar className="bg-blue-500/10 text-blue-500" icon={<UserOutlined />} />
                    <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{r.first_name} {r.last_name}</span>
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
                <Tag color="blue" className="bg-blue-500/10 border-none px-3 text-[11px]">
                    {d || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Biriktirilgan Test',
            dataIndex: 'assigned_exam',
            responsive: ['lg'] as any,
            render: (exam: string) => (
                <span className="text-amber-400 text-xs font-medium flex items-center">
                    <FileExcelOutlined className="mr-2" />
                    {exam || "Yo'q"}
                </span>
            ),
        },
        {
            title: 'Tel',
            dataIndex: 'phone_number',
            responsive: ['sm'] as any,
            render: (p: string) => <span className="text-slate-400 font-mono text-[11px]">{p || '—'}</span>,
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 100,
            render: (r: any) => (
                <Space size="middle">
                    <Tooltip title="Ma'lumotlarni ko'rish">
                        <Button
                            type="text"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            icon={<EyeOutlined />}
                            onClick={() => { setSelectedUser(r); setIsModalOpen(true); }}
                        />
                    </Tooltip>
                    <Tooltip title="O'chirish">
                        <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(r.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // --- ADD VIEW ---
    if (view === 'add') {
        return (
            <div className="p-3 sm:p-4 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => setView('list')}
                        className="bg-slate-800 border-none text-white rounded-xl hover:bg-slate-700 shrink-0"
                    />
                    <h2 className="text-lg sm:text-2xl font-bold text-white m-0">
                        Excel orqali ommaviy qo'shish
                    </h2>
                </div>

                <div className="w-full max-w-2xl bg-slate-900/40 p-5 sm:p-10 rounded-[24px] sm:rounded-[40px] border border-slate-800 backdrop-blur-md shadow-2xl">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            label={<span className="text-slate-400 font-medium text-sm">1. Testni tanlang</span>}
                            name="exam_id"
                            rules={[{ required: true, message: 'Iltimos, testni tanlang' }]}
                        >
                            <Select
                                placeholder="Testni tanlang"
                                className="h-11 sm:h-12 custom-dark-select"
                            >
                                {exams.map((e: any) => (
                                    <Option key={e.id} value={e.id}>{e.title}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-slate-400 font-medium text-sm">2. Excel faylni yuklang</span>}
                        >
                            <Dragger
                                beforeUpload={(file) => { setFileList([file]); return false; }}
                                fileList={fileList}
                                onRemove={() => setFileList([])}
                                accept=".xlsx"
                                className="bg-slate-950/50 border-slate-800 border-dashed rounded-2xl sm:rounded-3xl py-5 sm:py-8"
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined className="text-blue-500 text-3xl sm:text-4xl" />
                                </p>
                                <p className="text-white font-bold mt-2 text-sm sm:text-base">
                                    Faylni yuklang yoki sudrab keling
                                </p>
                                <p className="text-slate-500 text-xs mt-1 px-4">
                                    Ism, familiya, username va tel ustunlari bo'lishi shart
                                </p>
                            </Dragger>
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<CloudUploadOutlined />}
                            block
                            className="h-12 sm:h-14 bg-blue-600 hover:bg-blue-500 border-none rounded-2xl font-bold text-base sm:text-lg mt-4 shadow-lg shadow-blue-600/20"
                        >
                            Ma'lumotlarni bazaga yuklash
                        </Button>
                    </Form>
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="p-2 sm:p-3 space-y-4 sm:space-y-6 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <Input
                    placeholder="Xodimlarni qidirish..."
                    prefix={<SearchOutlined className="text-slate-500" />}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full sm:w-72 h-11 sm:h-12 bg-slate-900 border-slate-800 text-white rounded-2xl"
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setView('add')}
                    className="h-11 sm:h-12 px-5 sm:px-8 bg-blue-600 hover:bg-blue-500 border-none rounded-2xl font-bold shadow-lg shadow-blue-600/20"
                >
                    <span className="hidden sm:inline">Ommaviy qo'shish</span>
                    <span className="sm:hidden">Qo'shish</span>
                </Button>
            </div>

            {/* Jadval / Mobile kartalar */}
            {isMobile ? (
                <div>
                    {filtered.length === 0 && !loading ? (
                        <div className="text-center py-12 text-slate-500 text-sm">Xodim topilmadi</div>
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
                                className="text-slate-400 border-slate-700"
                            >← Oldingi</Button>
                            <span className="text-slate-500 text-sm self-center px-2">
                                {currentPage} / {Math.ceil(filtered.length / pageSize)}
                            </span>
                            <Button
                                size="small"
                                disabled={currentPage >= Math.ceil(filtered.length / pageSize)}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="text-slate-400 border-slate-700"
                            >Keyingi →</Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <Table
                        columns={columns}
                        dataSource={filtered}
                        loading={loading}
                        rowKey="id"
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
                    <div className="bg-[#0f172a] border border-slate-800 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl">
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
                                        {selectedUser.first_name} {selectedUser.last_name}
                                    </h3>
                                    <p className="text-slate-500 m-0 text-sm">@{selectedUser.username}</p>
                                </div>
                            </div>
                            <Button
                                type="text"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full shrink-0"
                            >✕</Button>
                        </div>

                        {/* Login Card */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-blue-500/20 mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <LockOutlined className="text-blue-500" />
                                <span className="text-blue-400 text-[11px] font-bold uppercase tracking-widest">
                                    Kirish ma'lumotlari
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center gap-3">
                                    <span className="text-slate-400 text-xs shrink-0">Login:</span>
                                    <code className="bg-slate-950 px-3 py-1 rounded-lg text-blue-400 font-mono text-xs sm:text-sm border border-slate-800 truncate max-w-[60%]">
                                        {selectedUser.username}
                                    </code>
                                </div>
                                <div className="flex justify-between items-center gap-3">
                                    <span className="text-slate-400 text-xs shrink-0">Parol:</span>
                                    <code className="bg-slate-950 px-3 py-1 rounded-lg text-emerald-400 font-mono text-xs sm:text-sm border border-slate-800 truncate max-w-[60%]">
                                        {selectedUser.password || '—'}
                                    </code>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-3 sm:mt-4 italic leading-relaxed m-0">
                                * Xodim ushbu ma'lumotlar orqali mobil yoki veb ilovaga kirib test topshirishi mumkin.
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 m-0">Bo'lim</p>
                                <p className="text-slate-200 text-xs sm:text-sm font-medium truncate m-0">
                                    {selectedUser.department || '—'}
                                </p>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 m-0">Telefon</p>
                                <p className="text-slate-200 text-xs sm:text-sm font-medium m-0">
                                    {selectedUser.phone_number || '—'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-3 sm:p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 m-0">Biriktirilgan test</p>
                                <p className="text-amber-500 text-xs sm:text-sm font-bold m-0 truncate">
                                    {selectedUser.assigned_exam || 'Mavjud emas'}
                                </p>
                            </div>
                            <FileExcelOutlined className="text-xl sm:text-2xl text-slate-700 shrink-0" />
                        </div>

                        <Button
                            block
                            className="mt-4 sm:mt-6 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold"
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

export default UsersSection;