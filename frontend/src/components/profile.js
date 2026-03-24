import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRightFromBracket, faCheckCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import './css/plans.css';
import './css/style.css';
import './css/profile.css';
import API_BASE_URL from '../config/api';
import BottomNav from './BottomNav';

const PROFILE_STORAGE_KEY = 'profileDetails';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileMessage, setProfileMessage] = useState('');
    const [profileError, setProfileError] = useState('');
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        address: '',
        dateOfBirth: '',
        gender: ''
    });

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changeMessage, setChangeMessage] = useState('');
    const [changeError, setChangeError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        const parsedProfile = savedProfile ? JSON.parse(savedProfile) : {};

        setProfileForm({
            fullName: parsedProfile.fullName || parsedUser.name || '',
            email: parsedProfile.email || parsedUser.email || '',
            phone: parsedProfile.phone || '',
            country: parsedProfile.country || '',
            city: parsedProfile.city || '',
            address: parsedProfile.address || '',
            dateOfBirth: parsedProfile.dateOfBirth || '',
            gender: parsedProfile.gender || ''
        });
    }, []);

    const completionPercent = useMemo(() => {
        const fields = [
            profileForm.fullName,
            profileForm.email,
            profileForm.phone,
            profileForm.country,
            profileForm.city,
            profileForm.address,
            profileForm.dateOfBirth,
            profileForm.gender
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    }, [profileForm]);

    const handleProfileInput = (e) => {
        const { name, value } = e.target;
        setProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setProfileMessage('');
        setProfileError('');

        if (!profileForm.fullName.trim() || !profileForm.email.trim() || !profileForm.phone.trim()) {
            setProfileError('Full Name, Email, and Mobile Number are required to complete profile.');
            return;
        }

        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileForm));

        if (user) {
            const updatedUser = {
                ...user,
                name: profileForm.fullName,
                email: profileForm.email
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        setProfileMessage('Profile details saved successfully.');
        setTimeout(() => setProfileMessage(''), 3000);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setChangeMessage('');
        setChangeError('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setChangeError('All password fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setChangeError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setChangeError('Password must be at least 6 characters long');
            return;
        }

        if (oldPassword === newPassword) {
            setChangeError('New password must be different from old password');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                setChangeError(data.message || 'Failed to change password');
                return;
            }

            setChangeMessage('Password changed successfully.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setChangeMessage(''), 3000);
        } catch (error) {
            setChangeError(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="main-wrapper dom-wrapper">
            <div className="main-container dom-container">
                <div className="dashboard-modern-hero dashboard-service-hero">
                    <div className="dashboard-modern-hero-top">
                        <div>
                            <p className="dashboard-service-label">Account</p>
                            <h1 className="dashboard-modern-title">Profile</h1>
                        </div>
                        <div className="dashboard-header-actions">
                            <button className="dashboard-modern-edit-link2" aria-hidden="true" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>

                   
                </div>

                <section className="dashboard-showcase profile-modern-section">
                    <div className="profile-modern-card">
                        <div className="profile-modern-card-head">
                            <h3>
                                <FontAwesomeIcon icon={faCheckCircle} /> Complete Profile
                            </h3>
                            <p>Add your details to complete your profile.</p>
                        </div>

                        <form onSubmit={handleSaveProfile} className="profile-modern-form">
                            <div className="profile-grid-two">
                                <input
                                    name="fullName"
                                    value={profileForm.fullName}
                                    onChange={handleProfileInput}
                                    className="profile-modern-input"
                                    placeholder="Full Name"
                                    required
                                />
                                <input
                                    name="email"
                                    value={profileForm.email}
                                    onChange={handleProfileInput}
                                    className="profile-modern-input"
                                    placeholder="Email"
                                    type="email"
                                    required
                                />
                                <input
                                    name="phone"
                                    value={profileForm.phone}
                                    onChange={handleProfileInput}
                                    className="profile-modern-input"
                                    placeholder="Mobile Number"
                                    required
                                />
                                <input
                                    name="country"
                                    value={profileForm.country}
                                    onChange={handleProfileInput}
                                    className="profile-modern-input"
                                    placeholder="Country"
                                />
                                <input
                                    name="city"
                                    value={profileForm.city}
                                    onChange={handleProfileInput}
                                    className="profile-modern-input"
                                    placeholder="City"
                                />
                                <select
                                    name="gender"
                                    value={profileForm.gender}
                                    onChange={handleProfileInput}
                                    className="profile-modern-input"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <input
                                    name="dateOfBirth"
                                    value={profileForm.dateOfBirth}
                                    onChange={handleProfileInput}
                                    className="profile-modern-input"
                                    type="date"
                                />
                                <input
                                    name="address"
                                    value={profileForm.address}
                                    onChange={handleProfileInput}
                                    className="profile-modern-input"
                                    placeholder="Address"
                                />
                            </div>

                            {profileMessage && <div className="success-message">{profileMessage}</div>}
                            {profileError && <div className="error-message">{profileError}</div>}

                            <button type="submit" className="profile-modern-btn">
                                Save Profile
                            </button>
                        </form>
                    </div>
                </section>

                <section className="dashboard-showcase profile-modern-section">
                    <div className="profile-modern-card">
                        <div className="profile-modern-card-head">
                            <h3>
                                <FontAwesomeIcon icon={faLock} /> Change Password
                            </h3>
                            <p>Keep your account secure by updating your password.</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="profile-modern-form">
                            <input
                                type="password"
                                className="profile-modern-input"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Current Password"
                                required
                            />
                            <input
                                type="password"
                                className="profile-modern-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                required
                            />
                            <input
                                type="password"
                                className="profile-modern-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password"
                                required
                            />

                            {changeMessage && <div className="success-message">{changeMessage}</div>}
                            {changeError && <div className="error-message">{changeError}</div>}

                            <button type="submit" className="profile-modern-btn" disabled={isLoading}>
                                {isLoading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </section>

                <section className="dashboard-showcase profile-modern-section profile-logout-wrap">
                    <button className="profile-logout-btn" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faRightFromBracket} /> Logout
                    </button>
                </section>

                <BottomNav />
            </div>
        </div>
    );
};

export default Profile;