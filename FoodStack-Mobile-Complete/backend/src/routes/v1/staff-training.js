const express = require('express');
const router = express.Router();

// Mock training data
const mockTraining = {
  progress: {
    totalModules: 12,
    completedModules: 7,
    totalHours: 24,
    completedHours: 15.5,
    certificates: 5,
    currentStreak: 7,
  },
  modules: [
    {
      id: '1',
      title: 'Hướng dẫn nhân viên mới',
      description: 'Tìm hiểu về quy trình làm việc, văn hóa công ty và các chính sách cơ bản',
      category: 'ONBOARDING',
      difficulty: 'BEGINNER',
      duration: 120,
      progress: 100,
      status: 'COMPLETED',
      lessons: [
        { id: '1-1', title: 'Giới thiệu công ty', type: 'VIDEO', duration: 30, compl