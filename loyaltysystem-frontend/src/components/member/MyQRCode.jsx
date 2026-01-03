import { useEffect, useState } from 'react';
import { Card, Spin, Typography, message, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { Title, Paragraph } = Typography;

const MyQRCode = () => {
    const { user } = useAuth();
    const [qrPayload, setQrPayload] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchQR = async () => {
        if (!user?.member?.id) return;
        setLoading(true);
        try {
            const response = await api.get(`/members/${user.member.id}/qr`);
            setQrPayload(JSON.stringify(response.data.data)); // Stringify for QR content
        } catch (error) {
            console.error("Failed to fetch QR", error);
            message.error("Could not load your QR code");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQR();
    }, [user]);

    if (!user?.member?.id) return <div style={{ textAlign: 'center', marginTop: 50 }}>No Member Profile Linked</div>;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Card
                style={{ textAlign: 'center', width: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                actions={[
                    <Button type="text" icon={<ReloadOutlined />} onClick={fetchQR} loading={loading}>Refresh Code</Button>
                ]}
            >
                <Title level={4}>My Digital Card</Title>
                <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                    Show this QR code to staff to earn points
                </Paragraph>

                {loading ? (
                    <div style={{ height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div style={{ padding: 10, background: 'white', display: 'inline-block' }}>
                        <QRCodeCanvas
                            value={qrPayload || ''}
                            size={300}
                            level="M"
                            includeMargin={true}
                            bgColor="#ffffff"
                            fgColor="#000000"
                        />
                    </div>
                )}

                <div style={{ marginTop: 20 }}>
                    <Text strong>{user.member.member_code}</Text>
                </div>
            </Card>
        </div>
    );
};

// Re-using Text component that I missed importing in the main body
import { Typography as AntTypo } from 'antd';
const { Text } = AntTypo;

export default MyQRCode;
