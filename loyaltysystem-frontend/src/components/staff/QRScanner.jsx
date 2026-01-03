import { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Select, InputNumber, Modal, message, Spin, Statistic, Result, Row, Col, Radio, Input } from 'antd';
import { QrcodeOutlined, SwapOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import api from '../../services/api';

const { Option } = Select;

const QRScanner = () => {
    const [scanning, setScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [scannedData, setScannedData] = useState(null);
    const [transactionResult, setTransactionResult] = useState(null);
    const [fileScanLoading, setFileScanLoading] = useState(false);
    const [form] = Form.useForm();
    const scannerRef = useRef(null);
    const fileScannerRef = useRef(null);

    // Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                // Ensure we only show active categories
                const activeCategories = response.data.data.filter(c => c.active);
                setCategories(activeCategories);
            } catch (error) {
                message.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    // Initialize Scanner
    useEffect(() => {
        if (!scanning || scannedData || transactionResult) return;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 20,
                    qrbox: { width: 280, height: 280 },
                    aspectRatio: 1.0,
                    disableFlip: true,
                    rememberLastUsedCamera: true,
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
                },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        }, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [scanning, scannedData, transactionResult]);

    const handleDecodedText = (decodedText, { showError } = {}) => {
        try {
            const payload = JSON.parse(decodedText);

            // Basic client-side validation logic
            if (!payload.member_id || !payload.checksum) {
                throw new Error("Invalid QR Format");
            }

            // Stop scanning and show form
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
            setScannedData(payload);
            setScanning(false);
            message.success('QR Code Scanned successfully');
        } catch (err) {
            console.error(err);
            // Don't interrupt scanning for every frame error, but alert if parse fails on a "success" callback
            // message.error('Invalid QR Code'); 
            if (showError) {
                message.error('Invalid QR code format');
            }
        }
    };

    const onScanSuccess = (decodedText, decodedResult) => {
        handleDecodedText(decodedText, { showError: false });
    };

    const onScanFailure = (error) => {
        // console.warn(`Code scan error = ${error}`);
    };

    const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const resampleImageFile = async (file, maxSize = 800) => {
        const dataUrl = await readFileAsDataUrl(file);
        const img = new Image();

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dataUrl;
        });

        const scale = Math.min(1, maxSize / Math.max(img.width || 1, img.height || 1));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            throw new Error('Canvas not supported');
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!blob) {
            throw new Error('Image conversion failed');
        }

        const safeName = file.name.replace(/\.[^/.]+$/, '');
        return new File([blob], `${safeName}-resized.png`, { type: 'image/png' });
    };

    const decodeFile = async (file) => {
        if (!fileScannerRef.current) {
            fileScannerRef.current = new Html5Qrcode("file-reader");
        }
        return await fileScannerRef.current.scanFile(file, true);
    };

    const handleFileScan = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            message.error('Please select an image file');
            event.target.value = '';
            return;
        }

        setFileScanLoading(true);
        try {
            if (scannerRef.current) {
                await scannerRef.current.clear().catch(() => {});
            }

            try {
                const decodedText = await decodeFile(file);
                handleDecodedText(decodedText, { showError: true });
            } catch (firstErr) {
                const resizedFile = await resampleImageFile(file, 800);
                const decodedText = await decodeFile(resizedFile);
                handleDecodedText(decodedText, { showError: true });
            }
        } catch (err) {
            console.error(err);
            message.error('No QR code detected in the selected image');
        } finally {
            setFileScanLoading(false);
            event.target.value = '';
        }
    };

    const handleReset = () => {
        setScannedData(null);
        setTransactionResult(null);
        setScanning(true);
        form.resetFields();
    };

    const onFinish = (values) => {
        Modal.confirm({
            title: 'Confirm Transaction',
            content: (
                <div>
                    <p><strong>Member ID:</strong> {scannedData?.member_id}</p>
                    <p><strong>Category:</strong> {categories.find(c => c.id === values.category_id)?.name}</p>
                    <p><strong>Action:</strong> {values.action}</p>
                    <p><strong>Amount:</strong> ₱{values.amount}</p>
                </div>
            ),
            onOk: async () => {
                await processTransaction(values);
            }
        });
    };

    const processTransaction = async (values) => {
        setLoading(true);
        try {
            const payload = {
                qr_payload: scannedData,
                category_id: values.category_id,
                action: values.action,
                amount: values.amount,
                notes: values.notes
            };

            const response = await api.post('/scan', payload);

            setTransactionResult(response.data.data);
            message.success('Transaction processed successfully!');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Transaction failed';
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Staff Transaction Terminal">

            {/* 1. Scanner View */}
            {scanning && !scannedData && !transactionResult && (
                <div style={{ textAlign: 'center' }}>
                    <div id="reader" width="100%"></div>
                    <div
                        id="file-reader"
                        style={{
                            position: 'absolute',
                            left: -10000,
                            top: -10000,
                            width: 300,
                            height: 300,
                            overflow: 'hidden'
                        }}
                    ></div>
                    <div style={{ marginTop: 12 }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileScan}
                            disabled={fileScanLoading}
                        />
                    </div>
                    <p style={{ marginTop: 10, color: '#888' }}>Point camera at member QR code</p>
                </div>
            )}

            {/* 2. Transaction Form */}
            {scannedData && !transactionResult && (
                <div>
                    <div style={{ marginBottom: 20, padding: 15, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        <strong>User Identified:</strong> {scannedData.member_id}
                        <Button type="link" size="small" onClick={handleReset} style={{ float: 'right' }}>Rescan</Button>
                    </div>

                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="category_id" label="Category" rules={[{ required: true, message: 'Select a category' }]}>
                            <Select placeholder="Select Transaction Category">
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="action" label="Action Type" rules={[{ required: true, message: 'Enter action (e.g., PURCHASE)' }]}>
                            <Radio.Group buttonStyle="solid" size="middle">
                                <Radio.Button value="PURCHASE">Purchase</Radio.Button>
                                <Radio.Button value="PAYMENT">Loan Payment</Radio.Button>
                                <Radio.Button value="DEPOSIT">Deposit</Radio.Button>
                                <Radio.Button value="ATTENDANCE">Event Attendance</Radio.Button>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item name="amount" label="Transaction Amount" rules={[{ required: true, message: 'Enter amount' }]}>
                            <InputNumber
                                min={0}
                                precision={2}
                                prefix="₱"
                                style={{ width: '100%' }}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item name="notes" label="Notes (Optional)">
                            <Input.TextArea
                                rows={3}
                                placeholder="Enter optional remarks..."
                                showCount
                                maxLength={200}
                                allowClear
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<SwapOutlined />}>
                                Process Transaction
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}

            {/* 3. Success Result */}
            {transactionResult && (
                <Result
                    status="success"
                    title="Transaction Successful!"
                    subTitle={`Ref: ${transactionResult.reference_no}`}
                    extra={[
                        <Row gutter={16} key="stats" justify="center" style={{ marginBottom: 20 }}>
                            <Col span={12}>
                                <Statistic title="Points Earned" value={transactionResult.points_earned} precision={2} valueStyle={{ color: '#3f8600' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title="New Balance" value={transactionResult.new_balance} precision={2} />
                            </Col>
                        </Row>,
                        <Button type="primary" key="next" onClick={handleReset} size="large">
                            Process Next Transaction
                        </Button>
                    ]}
                />
            )}
        </Card>
    );
};

export default QRScanner;
