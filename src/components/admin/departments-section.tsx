import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, Form, Space } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    ApartmentOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';

const DepartmentsSection: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<any>(null);

    const [form] = Form.useForm();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/departments/');
            setDepartments(data?.results || (Array.isArray(data) ? data : []));
        } catch {
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    const onFinish = async (values: { name: string; description: string }) => {
        try {
            setLoading(true);
            await apiFetch('/departments/', {
                method: 'POST',
                body: JSON.stringify({
                    name: values.name.trim(),
                    description: values.description || '',
                }),
            });
            toast.success("Bo'lim qo'shildi");
            setIsCreateModalOpen(false);
            form.resetFields();
            fetchDepartments();
        } catch {
            toast.error("Qo'shishda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (id: number) => {
        try {
            setLoading(true);
            const data = await apiFetch(`/departments/${id}/`);
            setSelectedDept(data);
            setIsViewModalOpen(true);
        } catch {
            toast.error("Ma'lumotni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: <span className="text-white font-bold text-lg">Bo'limni o'chirish</span>,
            icon: <ExclamationCircleOutlined className="text-red-500" />,
            content: <p className="text-slate-400 mt-2">Haqiqatan ham ushbu bo'limni o'chirmoqchimisiz?</p>,
            okText: "O'chirish",
            okType: 'danger',
            centered: true,
            rootClassName: 'custom-confirm-modal',
            okButtonProps: {
                className: 'bg-red-600 hover:bg-red-700 border-none h-10 px-6 rounded-lg font-medium',
            },
            cancelButtonProps: {
                className: 'bg-slate-800 hover:bg-slate-700 border-none text-slate-300 h-10 px-6 rounded-lg',
            },
            onOk: async () => {
                try {
                    await apiFetch(`/departments/${id}/`, { method: 'DELETE' });
                    toast.success("Bo'lim muvaffaqiyatli o'chirildi");
                    fetchDepartments();
                } catch {
                    toast.error("O'chirishda xatolik yuz berdi");
                }
            },
        });
    };

    const filteredDepartments = departments.filter((d: any) =>
        d.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // --- MOBILE CARD ---
    const MobileCard = ({ record, index }: { record: any; index: number }) => (
        <div className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <ApartmentOutlined className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider m-0">#{index + 1}</p>
                        <h4 className="text-white font-semibold text-sm m-0 truncate">{record.name}</h4>
                        {record.description && (
                            <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{record.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-1 shrink-0">
                    <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined className="text-blue-400" />}
                        onClick={() => handleView(record.id)}
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
        </div>
    );

    const columns = [
        {
            title: '#',
            dataIndex: 'id',
            width: 60,
            render: (_: any, __: any, i: number) => <span className="text-slate-500">{i + 1}</span>,
        },
        {
            title: "Bo'lim nomi",
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <ApartmentOutlined className="text-blue-500" />
                    <span className="text-slate-200 font-medium">{text}</span>
                </Space>
            ),
        },
        {
            title: 'Tavsif',
            dataIndex: 'description',
            ellipsis: true,
            responsive: ['md'] as any,
            render: (text: string) => <span className="text-slate-500 text-sm">{text || '—'}</span>,
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 100,
            render: (record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined className="text-blue-400" />}
                        onClick={() => handleView(record.id)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white m-0">Struktura</h1>
                    <p className="text-slate-500 text-xs sm:text-sm m-0">Barcha bo'limlar ro'yxati</p>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="Qidirish..."
                        prefix={<SearchOutlined className="text-slate-500" />}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="h-10 sm:h-11 bg-slate-900 border-slate-800 text-white rounded-xl flex-1 sm:w-56"
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-10 sm:h-11 bg-blue-600 border-none rounded-xl px-3 sm:px-5 shrink-0"
                    >
                        <span className="hidden sm:inline">Bo'lim qo'shish</span>
                        <span className="sm:hidden">Qo'shish</span>
                    </Button>
                </div>
            </div>

            {/* Jadval yoki Mobile kartalar */}
            {isMobile ? (
                <div>
                    {filteredDepartments.length === 0 && !loading ? (
                        <div className="text-center py-12 text-slate-500 text-sm">Bo'lim topilmadi</div>
                    ) : (
                        filteredDepartments.map((dept: any, idx: number) => (
                            <MobileCard key={dept.id} record={dept} index={idx} />
                        ))
                    )}
                </div>
            ) : (
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <Table
                        columns={columns}
                        dataSource={filteredDepartments}
                        loading={loading}
                        rowKey="id"
                        className="custom-dark-table"
                        scroll={{ x: 400 }}
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                    />
                </div>
            )}

            {/* --- VIEW MODAL --- */}
            <Modal
                title={null}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={null}
                centered
                width="95%"
                style={{ maxWidth: 500 }}
                className="dark-modal-container"
                closeIcon={<span className="text-slate-500 hover:text-white">✕</span>}
            >
                {selectedDept && (
                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden">
                        <div className="h-16 sm:h-20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-5 sm:px-6 flex items-center border-b border-slate-800">
                            <Space>
                                <ApartmentOutlined className="text-xl sm:text-2xl text-blue-500" />
                                <span className="text-white font-bold text-lg sm:text-xl">Bo'lim ma'lumotlari</span>
                            </Space>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="space-y-1">
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Nomi</p>
                                <h3 className="text-white text-xl sm:text-2xl font-bold m-0">{selectedDept.name}</h3>
                            </div>

                            <div className="space-y-2">
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Tavsif</p>
                                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                                    <p className="text-slate-300 m-0 leading-relaxed italic text-sm">
                                        {selectedDept.description || 'Tavsif kiritilmagan.'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold m-0">Yaratilgan sana</p>
                                    <p className="text-slate-300 text-sm m-0 mt-1">
                                        {new Date(selectedDept.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <CalendarOutlined className="text-blue-500 text-xl" />
                            </div>

                            <Button
                                onClick={() => setIsViewModalOpen(false)}
                                className="w-full h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-xl font-bold"
                            >
                                Yopish
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- CREATE MODAL --- */}
            <Modal
                title={null}
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                centered
                width="95%"
                style={{ maxWidth: 450 }}
                className="dark-modal-container"
                closeIcon={<span className="text-slate-500 hover:text-white mt-2 mr-2">✕</span>}
            >
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-4 sm:p-6 border-b border-slate-800/50 bg-slate-900/20">
                        <h3 className="text-white font-bold text-lg sm:text-xl m-0 flex items-center gap-2">
                            <PlusOutlined className="text-blue-500" />
                            Yangi Bo'lim
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 m-0">
                            Kompaniya strukturasiga yangi bo'lim qo'shish
                        </p>
                    </div>

                    <div className="p-4 sm:p-6">
                        <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-4">
                            <Form.Item
                                label={<span className="text-slate-400 font-medium">Bo'lim nomi</span>}
                                name="name"
                                rules={[{ required: true, message: 'Nomni kiriting' }]}
                            >
                                <Input
                                    placeholder="Masalan: HR, IT yoki Logistika"
                                    className="h-11 sm:h-12 bg-slate-950 border-slate-800 text-white rounded-xl focus:border-blue-500 hover:border-slate-700"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-slate-400 font-medium">Tavsif (Ixtiyoriy)</span>}
                                name="description"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Bo'lim vazifalari haqida qisqacha..."
                                    className="bg-slate-950 border-slate-800 text-white rounded-xl hover:border-slate-700 p-3"
                                />
                            </Form.Item>

                            <div className="flex gap-3 pt-1">
                                <Button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 border-none text-slate-300 rounded-xl font-medium"
                                >
                                    Bekor
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="flex-[2] h-11 sm:h-12 bg-blue-600 hover:bg-blue-500 border-none rounded-xl font-bold shadow-lg shadow-blue-600/20"
                                >
                                    Saqlash
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DepartmentsSection;