// ── routes/index.js — Central router ─────────────────────────
const express  = require('express');
const router   = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

// ── Auth ──────────────────────────────────────────────────────
const auth = require('../controllers/auth.controller');
router.post('/auth/register', auth.register);
router.post('/auth/login',    auth.login);
router.get( '/auth/me',       protect, auth.getMe);

// ── Site Settings / CMS (public read) ─────────────────────────
const settings = require('../controllers/settings.controller');
router.get('/settings', settings.getSettings);


// ── Users ─────────────────────────────────────────────────────
const user = require('../controllers/user.controller');
router.get( '/users/profile',              protect, user.getProfile);
router.put( '/users/profile',              protect, user.updateProfile);
router.delete('/users/profile',            protect, user.deleteProfile);
router.post('/users/avatar',               protect, require('../middleware/upload').uploadAvatar, user.uploadAvatar);
router.put( '/users/password',             protect, user.changePassword);
router.get( '/users/notifications',        protect, user.getNotifications);
router.put( '/users/notifications/read',   protect, user.markNotificationsRead);
router.get( '/users/bookmarks',            protect, user.getBookmarks);
router.post('/users/bookmarks',            protect, user.toggleBookmark);

// ── Emergency ─────────────────────────────────────────────────
const emg = require('../controllers/emergency.controller');
router.get( '/sos',          emg.getSOS);
router.get( '/emergency',    emg.getAll);
router.get( '/emergency/:id',emg.getOne);
router.post('/emergency',    protect, emg.create);
router.put( '/emergency/:id',protect, emg.update);
router.delete('/emergency/:id', protect, adminOnly, emg.remove);

// ── Blood Donors ──────────────────────────────────────────────
const blood = require('../controllers/blood.controller');
router.get( '/blood-donors',              blood.getAll);
router.post('/blood-donors',              protect, blood.register);
router.get( '/blood-donors/me',           protect, blood.getMyDonor);
router.put( '/blood-donors/availability', protect, blood.toggleAvailability);
router.put( '/blood-donors/me',           protect, blood.update);

// ── Donations ─────────────────────────────────────────────────
const don = require('../controllers/donation.controller');
router.get( '/donations',      don.getAll);
router.get( '/donations/mine', protect, don.getMyDonations);
router.get( '/donations/:id',  don.getOne);
router.post('/donations',      protect, require('../middleware/upload').uploadDonation, don.create);
router.post('/donations/:id/donate', protect, don.donate);

// ── Jobs ──────────────────────────────────────────────────────
const job = require('../controllers/job.controller');
router.get( '/jobs',                      job.getAll);
router.get( '/jobs/mine',                 protect, job.getMyPostedJobs);
router.get( '/jobs/my-applications',      protect, job.getMyApplications);
router.post('/jobs',                      protect, job.create);
router.get( '/jobs/:id',                  job.getOne);
router.put( '/jobs/:id',                  protect, job.update);
router.delete('/jobs/:id',               protect, job.remove);
router.post('/jobs/:id/apply',           protect, require('../middleware/upload').uploadResume, job.apply);
router.get( '/jobs/:id/applications',    protect, job.getApplications);
router.put( '/jobs/applications/:appId', protect, job.updateApplication);

// ── Volunteers ────────────────────────────────────────────────
const vol = require('../controllers/volunteer.controller');
router.get( '/volunteers',    vol.getAll);
router.post('/volunteers',    protect, vol.register);
router.get( '/volunteers/me', protect, vol.getMyVolunteer);
router.put( '/volunteers/me', protect, vol.updateVolunteer);
router.delete('/volunteers/me', protect, vol.deactivate);

// ── Public Content (Doctors, Pharmacies, Notices, Education, Scholarships) ──
const cnt = require('../controllers/content.controller');
router.get('/doctors',      cnt.getDoctors);
router.get('/doctors/:id',  cnt.getDoctorById);
router.get('/pharmacies',   cnt.getPharmacies);
router.get('/notices',      cnt.getNotices);
router.get('/education',    cnt.getEducation);
router.get('/education/:id', cnt.getEducationById);
router.get('/scholarships', cnt.getScholarships);

// ── Directory (Hospitals, Services, Government, Finance) ──
const dir = require('../controllers/directory.controller');
router.get('/directory',     dir.getAll);
router.get('/directory/:id', dir.getOne);

// ── Admin ─────────────────────────────────────────────────────
const adm = require('../controllers/admin.controller');
const A   = [protect, adminOnly];

router.get( '/admin/dashboard', ...A, adm.getDashboard);
router.get( '/admin/analytics', ...A, adm.getAnalytics);

// Users
router.get(   '/admin/users',            ...A, adm.getUsers);
router.put(   '/admin/users/:id/toggle', ...A, adm.toggleUser);
router.put(   '/admin/users/:id/role',   ...A, adm.changeRole);
router.delete('/admin/users/:id',        ...A, adm.deleteUser);

// Donations
router.get(   '/admin/donations',         ...A, adm.getDonations);
router.put(   '/admin/donations/:id',     ...A, adm.updateDonationStatus);
router.delete('/admin/donations/:id',     ...A, adm.deleteDonation);

// Jobs
router.get(   '/admin/jobs',              ...A, adm.getAllJobs);
router.post(  '/admin/jobs',              ...A, adm.createJob);
router.put(   '/admin/jobs/:id',          ...A, adm.updateJob);
router.delete('/admin/jobs/:id',          ...A, adm.deleteJob);
router.put(   '/admin/jobs/:id/status',   ...A, adm.updateJobStatus);

// Blood donors
router.get(   '/admin/blood-donors',            ...A, adm.getBloodDonorsAdmin);
router.delete('/admin/blood-donors/:id',        ...A, adm.deleteBloodDonor);
router.put(   '/admin/blood-donors/:id/verify', ...A, adm.verifyBloodDonor);
router.put(   '/admin/blood-donors/:id/status', ...A, adm.approveBloodDonor);

// Volunteers
router.get(   '/admin/volunteers',             ...A, adm.getVolunteersAdmin);
router.delete('/admin/volunteers/:id',          ...A, adm.deleteVolunteer);
router.put(   '/admin/volunteers/:id/verify',   ...A, adm.verifyVolunteer);
router.put(   '/admin/volunteers/:id/status',   ...A, adm.approveVolunteer);

// Emergency
router.get(   '/admin/emergency',         ...A, adm.getEmergencyServices);
router.post(  '/admin/emergency',         ...A, adm.createEmergencyService);
router.put(   '/admin/emergency/:id',     ...A, adm.updateEmergencyService);
router.delete('/admin/emergency/:id',     ...A, adm.deleteEmergencyService);

// Reports & Announcements
router.get(   '/admin/reports',             ...A, adm.getReports);
router.put(   '/admin/reports/:id/resolve', ...A, adm.resolveReport);
router.post(  '/admin/announcements',       ...A, adm.createAnnouncement);

// Bulk Import
router.post(  '/admin/bulk-import',         ...A, adm.bulkImport);

// Settings (CMS)
router.put(   '/admin/settings',            ...A, settings.updateSettings);
// Backup
const backup = require('../controllers/backup.controller');
const multer = require('multer');
const os = require('os');
const uploadBackup = multer({ dest: os.tmpdir() });

router.get('/admin/backup/status',   ...A, backup.getBackupStatus);
router.get('/admin/backup/download', ...A, backup.downloadBackup);
router.post('/admin/backup/restore', ...A, uploadBackup.single('backup'), backup.restoreBackup);


// Admin CRUD — Doctors
router.get(   '/admin/doctors',      ...A, cnt.adminGetDoctors);
router.post(  '/admin/doctors',      ...A, cnt.adminCreateDoctor);
router.put(   '/admin/doctors/:id',  ...A, cnt.adminUpdateDoctor);
router.delete('/admin/doctors/:id',  ...A, cnt.adminDeleteDoctor);

// Admin CRUD — Pharmacies
router.get(   '/admin/pharmacies',     ...A, cnt.adminGetPharmacies);
router.post(  '/admin/pharmacies',     ...A, cnt.adminCreatePharmacy);
router.put(   '/admin/pharmacies/:id', ...A, cnt.adminUpdatePharmacy);
router.delete('/admin/pharmacies/:id', ...A, cnt.adminDeletePharmacy);

// Admin CRUD — Notices
router.get(   '/admin/notices',     ...A, cnt.adminGetNotices);
router.post(  '/admin/notices',     ...A, cnt.adminCreateNotice);
router.put(   '/admin/notices/:id', ...A, cnt.adminUpdateNotice);
router.delete('/admin/notices/:id', ...A, cnt.adminDeleteNotice);

// Admin CRUD — Education
router.get(   '/admin/education',     ...A, cnt.adminGetEducation);
router.post(  '/admin/education',     ...A, cnt.adminCreateEducation);
router.put(   '/admin/education/:id', ...A, cnt.adminUpdateEducation);
router.delete('/admin/education/:id', ...A, cnt.adminDeleteEducation);

// Admin CRUD — Scholarships
router.get(   '/admin/scholarships',     ...A, cnt.adminGetScholarships);
router.post(  '/admin/scholarships',     ...A, cnt.adminCreateScholarship);
router.put(   '/admin/scholarships/:id', ...A, cnt.adminUpdateScholarship);
router.delete('/admin/scholarships/:id', ...A, cnt.adminDeleteScholarship);

// Admin CRUD — Directory (Hospitals / Services / Government / Finance)
router.get(   '/admin/directory',      ...A, dir.adminGetAll);
router.post(  '/admin/directory',      ...A, dir.adminCreate);
router.put(   '/admin/directory/:id',  ...A, dir.adminUpdate);
router.delete('/admin/directory/:id',  ...A, dir.adminRemove);

module.exports = router;
