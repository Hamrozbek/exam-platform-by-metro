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
    const pageSize = 10;

    // Modal uchun statelar
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [empData, exmData] = await Promise.all([
                apiFetch('/users/employees/'),
                apiFetch('/exams/')
            ]);
            setEmployees(empData || []);
            setExams(exmData || []);
        } catch (error) {
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const onFinish = async (values: any) => {
        if (fileList.length === 0) {
            return toast.error("Iltimos, Excel faylni yuklang");
        }

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
        } catch (error) {
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
            className: "dark-confirm-modal",
            onOk: async () => {
                try {
                    await apiFetch(`/users/employees/${id}/delete/`, { method: 'DELETE' });
                    toast.success("Xodim o'chirildi");
                    fetchData();
                } catch (error) {
                    toast.error("Xatolik: Xodimni o'chirib bo'lmadi");
                }
            },
        });
    };

    const columns = [
        {
            title: '#',
            width: 60,
            render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1
        },
        {
            title: 'Foydalanuvchi',
            key: 'user',
            render: (r: any) => (
                <Space>
                    <Avatar className="bg-blue-500/10 text-blue-500 flex items-center justify-center" icon={<UserOutlined />} />
                    <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{r.first_name} {r.last_name}</span>
                        <span className="text-slate-500 text-[11px]">@{r.username}</span>
                    </div>
                </Space>
            )
        },
        {
            title: 'Bo\'lim',
            dataIndex: 'department',
            render: (d: string) => <Tag color="blue" className="bg-blue-500/10 border-none px-3 text-[11px]">{d || 'N/A'}</Tag>
        },
        {
            title: 'Biriktirilgan Test',
            dataIndex: 'assigned_exam',
            render: (exam: string) => (
                <span className="text-amber-400 text-xs font-medium flex items-center">
                    <FileExcelOutlined className="mr-2" />
                    {exam || 'Yo\'q'}
                </span>
            )
        },
        {
            title: 'Tel',
            dataIndex: 'phone_number',
            render: (p: string) => <span className="text-slate-400 font-mono text-[11px]">{p || '—'}</span>
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 120,
            render: (r: any) => (
                <Space size="middle">
                    <Tooltip title="Ma'lumotlarni ko'rish">
                        <Button
                            type="text"
                            className="text-blue-400 hover:text-blue-300 flex items-center justify-center"
                            icon={<EyeOutlined />}
                            onClick={() => { setSelectedUser(r); setIsModalOpen(true); }}
                        />
                    </Tooltip>
                    <Tooltip title="O'chirish">
                        <Button
                            danger
                            type="text"
                            className="flex items-center justify-center"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(r.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    if (view === 'add') {
        return (
            <div className="p-4 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-4 mb-8">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => setView('list')} className="bg-slate-800 border-none text-white rounded-xl hover:bg-slate-700" />
                    <h2 className="text-2xl font-bold text-white m-0">Excel orqali ommaviy qo'shish</h2>
                </div>

                <div className="max-w-2xl bg-slate-900/40 p-10 rounded-[40px] border border-slate-800 backdrop-blur-md shadow-2xl">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            label={<span className="text-slate-400 font-medium">1. Testni tanlang</span>}
                            name="exam_id"
                            rules={[{ required: true, message: 'Iltimos, testni tanlang' }]}
                        >
                            <Select placeholder="Testni tanlang" className="h-12 custom-dark-select">
                                {exams.map((e: any) => <Option key={e.id} value={e.id}>{e.title}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item label={<span className="text-slate-400 font-medium">2. Excel faylni yuklang</span>}>
                            <Dragger
                                beforeUpload={(file) => { setFileList([file]); return false; }}
                                fileList={fileList}
                                onRemove={() => setFileList([])}
                                accept=".xlsx"
                                className="bg-slate-950/50 border-slate-800 border-dashed rounded-3xl py-8"
                            >
                                <p className="ant-upload-drag-icon"><InboxOutlined className="text-blue-500 text-4xl" /></p>
                                <p className="text-white font-bold mt-2">Faylni yuklang yoki sudrab keling</p>
                                <p className="text-slate-500 text-xs mt-1">Ism, familiya, username va tel ustunlari bo'lishi shart</p>
                            </Dragger>
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<CloudUploadOutlined />}
                            block
                            className="h-14 bg-blue-600 hover:bg-blue-500 border-none rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            Ma'lumotlarni bazaga yuklash
                        </Button>
                    </Form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Input
                    placeholder="Xodimlarni qidirish..."
                    prefix={<SearchOutlined className="text-slate-500" />}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full md:w-80 h-12 bg-slate-900 border-slate-800 text-white rounded-2xl focus:border-blue-500 shadow-lg"
                />

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setView('add')}
                    className="w-full md:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-500 border-none rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                    Ommaviy qo'shish
                </Button>
            </div>

            {/* Jadval */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <Table
                    columns={columns}
                    dataSource={employees.filter((emp: any) =>
                        emp.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                        emp.username?.toLowerCase().includes(searchText.toLowerCase())
                    )}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        onChange: (page) => setCurrentPage(page),
                        className: "p-4"
                    }}
                    className="custom-dark-table"
                />
            </div>

            {/* Xodim detallari Modali */}
            <Modal
                title={null} // Custom Header ishlatamiz
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                closeIcon={null}
                width={450}
                className="p-0 overflow-hidden rounded-[32px]"
                modalRender={(modal) => (
                    <div className="bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl">
                        {modal}
                    </div>
                )}
            >
                {selectedUser && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <Avatar size={64} className="bg-blue-600 text-white flex items-center justify-center text-2xl" icon={<UserOutlined />} />
                                <div>
                                    <h3 className="text-white text-xl font-bold m-0">{selectedUser.first_name} {selectedUser.last_name}</h3>
                                    <p className="text-slate-500 m-0 text-sm">@{selectedUser.username}</p>
                                </div>
                            </div>
                            <Button
                                type="text"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full"
                            >✕</Button>
                        </div>

                        {/* Login Card */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 p-5 rounded-3xl border border-blue-500/20 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <LockOutlined className="text-blue-500" />
                                <span className="text-blue-400 text-[11px] font-bold uppercase tracking-widest">Kirish ma'lumotlari</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs">Login:</span>
                                    <code className="bg-slate-950 px-3 py-1 rounded-lg text-blue-400 font-mono text-sm border border-slate-800">
                                        {selectedUser.username}
                                    </code>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-xs">Parol:</span>
                                    <code className="bg-slate-950 px-3 py-1 rounded-lg text-emerald-400 font-mono text-sm border border-slate-800">
                                        {selectedUser.password_display || "secret123"}
                                    </code>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-4 italic leading-relaxed">
                                * Xodim ushbu ma'lumotlar orqali mobil yoki veb ilovaga kirib test topshirishi mumkin.
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1">Bo'lim</p>
                                <p className="text-slate-200 text-sm font-medium truncate">{selectedUser.department || '—'}</p>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1">Telefon</p>
                                <p className="text-slate-200 text-sm font-medium">{selectedUser.phone_number || '—'}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-[9px] uppercase font-bold mb-1">Biriktirilgan test</p>
                                <p className="text-amber-500 text-sm font-bold m-0">{selectedUser.assigned_exam || 'Mavjud emas'}</p>
                            </div>
                            <FileExcelOutlined className="text-2xl text-slate-700" />
                        </div>

                        <Button
                            block
                            className="mt-6 h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold"
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