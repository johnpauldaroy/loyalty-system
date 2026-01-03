import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { GiftOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../logo.png';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const { login } = useAuth();
    const navigate = useNavigate();

    const slides = [
        {
            tag: 'LOYALTY INSIGHTS',
            title: 'Reward Journeys, Simplified',
            description: 'Track member activity, automate points, and surface the moments that grow retention.',
            footer: 'Barbaza MPC Loyalty Platform',
            image: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #38bdf8 100%)'
        },
        {
            tag: 'BRANCH VISIBILITY',
            title: 'Every Branch, One View',
            description: 'Compare performance, validate transactions, and keep reward stock aligned across branches.',
            footer: 'Operations & Rewards Console',
            image: 'linear-gradient(140deg, #0b1020 0%, #1f2937 45%, #10b981 100%)'
        },
        {
            tag: 'MEMBER EXPERIENCE',
            title: 'Engage with Confidence',
            description: 'Create member profiles, manage QR access, and deliver consistent service in seconds.',
            footer: 'Member Experience Suite',
            image: 'linear-gradient(140deg, #111827 0%, #7c3aed 55%, #f59e0b 100%)'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const { user } = await login(values);
            message.success('Login successful');

            // Redirect based on role
            switch (user.role) {
                case 'admin':
                    navigate('/admin/analytics');
                    break;
                case 'staff':
                    navigate('/staff/scan');
                    break;
                case 'member':
                default:
                    navigate('/member/dashboard');
            }
        } catch (error) {
            console.error('Login Error Details:', error);
            const msg = error.response?.data?.message || error.message || 'Login failed. Please check credentials.';
            message.error(`Login Failed: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-shell">
                <div className="login-carousel">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.title}
                            className={`login-carousel-slide ${index === activeSlide ? 'is-active' : ''}`}
                            style={{ backgroundImage: slide.image }}
                        >
                            <div className="login-carousel-overlay" />
                            <div className="login-carousel-content">
                                <div className="login-carousel-tag">{slide.tag}</div>
                                <h2>{slide.title}</h2>
                                <p>{slide.description}</p>
                                <div className="login-carousel-footer">{slide.footer}</div>
                            </div>
                            <div className="login-carousel-dots">
                                {slides.map((_, dotIndex) => (
                                    <span
                                        key={dotIndex}
                                        className={dotIndex === activeSlide ? 'dot active' : 'dot'}
                                        onClick={() => setActiveSlide(dotIndex)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <Card className="login-card" bordered={false}>
                    <div className="login-brand">
                        <img src={logo} alt="Loyalty System logo" className="login-brand-image" />
                    </div>
                    <div className="login-header">
                        <div className="login-logo">
                            <GiftOutlined />
                        </div>
                        <div>
                            <h2>Welcome Back</h2>
                            <p>Sign in to your Loyalty account</p>
                        </div>
                    </div>

                    <Form
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: 'Please input your email!' }]}
                        >
                            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Email Address" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Password" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block className="login-submit">
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>
                    <div className="login-footer">Secure access to the Loyalty System</div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
