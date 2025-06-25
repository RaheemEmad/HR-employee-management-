import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, AlertCircle, CheckCircle, Plus, Minus, FileText, Edit, Trash2, Eye, EyeOff, LogOut, Shield, UserPlus } from 'lucide-react';

const LeaveTracker = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [leaveType, setLeaveType] = useState('annual');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');
  const [activeTab, setActiveTab] = useState('request');
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(''); // 'employee' or 'hr'
  const [currentUser, setCurrentUser] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '', showPassword: false });
  
  // Employee registration states
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    firstName: '',
    lastName: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  // Employee editing states
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', startDate: '' });

  // Initialize with sample data
  useEffect(() => {
    const sampleEmployees = [
      {
        id: 1,
        username: 'ahmed.hassan',
        name: 'Ahmed Hassan',
        startDate: '2024-01-15',
        annualLeave: { used: 8, total: 24 },
        casualLeave: { used: 3, total: 7 },
        sickLeave: { used: 2, total: 180 },
        leaveHistory: [
          { date: '2024-03-10', type: 'annual', days: 3, reason: 'Family vacation', status: 'approved' },
          { date: '2024-04-15', type: 'casual', days: 1, reason: 'Personal emergency', status: 'approved' },
        ]
      },
      {
        id: 2,
        username: 'fatma.ali',
        name: 'Fatma Ali',
        startDate: '2023-06-01',
        annualLeave: { used: 12, total: 24 },
        casualLeave: { used: 1, total: 7 },
        sickLeave: { used: 0, total: 180 },
        leaveHistory: [
          { date: '2024-02-20', type: 'annual', days: 5, reason: 'Wedding', status: 'approved' },
        ]
      }
    ];
    setEmployees(sampleEmployees);
  }, []);

  // Employee registration
  const handleEmployeeRegistration = () => {
    const { firstName, lastName, startDate } = registrationForm;
    
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both first and last name.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const username = `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}`;
    
    // Check if username already exists
    const existingEmployee = employees.find(emp => emp.username === username);
    if (existingEmployee) {
      alert('An employee with this name already exists. Please contact HR if this is an error.');
      return;
    }

    const newEmployee = {
      id: Date.now(),
      username: username,
      name: fullName,
      startDate: startDate,
      annualLeave: { used: 0, total: 24 },
      casualLeave: { used: 0, total: 7 },
      sickLeave: { used: 0, total: 180 },
      leaveHistory: []
    };

    setEmployees([...employees, newEmployee]);
    setRegistrationForm({ firstName: '', lastName: '', startDate: new Date().toISOString().split('T')[0] });
    setShowRegistration(false);
    alert(`Registration successful! Your username is: ${username}\nYour password is: bolder\nPlease login to continue.`);
  };

  // Authentication functions
  const handleLogin = () => {
    const { username, password } = loginForm;
    
    if (username === 'hr' && password === 'hr123') {
      setIsAuthenticated(true);
      setUserRole('hr');
      setCurrentUser('HR Administrator');
    } else if (password === 'bolder') {
      const employee = employees.find(emp => emp.username === username);
      if (employee) {
        setIsAuthenticated(true);
        setUserRole('employee');
        setCurrentUser(employee.name);
        setSelectedEmployee(employee.id.toString());
      } else {
        alert('Employee not found. Please register first or contact HR.');
      }
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('');
    setCurrentUser('');
    setSelectedEmployee('');
    setLoginForm({ username: '', password: '', showPassword: false });
  };

  // Employee CRUD operations
  const addEmployee = () => {
    if (newEmployeeName.trim()) {
      const username = newEmployeeName.toLowerCase().replace(/\s+/g, '.');
      const newEmployee = {
        id: Date.now(),
        username: username,
        name: newEmployeeName.trim(),
        startDate: new Date().toISOString().split('T')[0],
        annualLeave: { used: 0, total: 24 },
        casualLeave: { used: 0, total: 7 },
        sickLeave: { used: 0, total: 180 },
        leaveHistory: []
      };
      setEmployees([...employees, newEmployee]);
      setNewEmployeeName('');
    }
  };

  const startEditEmployee = (employee) => {
    setEditingEmployee(employee.id);
    setEditForm({ name: employee.name, startDate: employee.startDate });
  };

  const saveEditEmployee = () => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === editingEmployee) {
        return {
          ...emp,
          name: editForm.name,
          startDate: editForm.startDate,
          username: editForm.name.toLowerCase().replace(/\s+/g, '.')
        };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    setEditingEmployee(null);
    setEditForm({ name: '', startDate: '' });
  };

  const cancelEditEmployee = () => {
    setEditingEmployee(null);
    setEditForm({ name: '', startDate: '' });
  };

  const deleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      if (selectedEmployee === employeeId.toString()) {
        setSelectedEmployee('');
      }
    }
  };

  const submitLeaveRequest = () => {
    if (!selectedEmployee || !leaveReason.trim()) return;

    const employeeIndex = employees.findIndex(emp => emp.id.toString() === selectedEmployee);
    if (employeeIndex === -1) return;

    const updatedEmployees = [...employees];
    const employee = updatedEmployees[employeeIndex];

    // Check if employee has enough leave balance
    let hasEnoughBalance = true;
    let balanceMessage = '';

    if (leaveType === 'annual') {
      const remaining = employee.annualLeave.total - employee.annualLeave.used;
      if (leaveDays > remaining) {
        hasEnoughBalance = false;
        balanceMessage = `Insufficient annual leave balance. You have ${remaining} days remaining.`;
      }
    } else if (leaveType === 'casual') {
      const remaining = employee.casualLeave.total - employee.casualLeave.used;
      if (leaveDays > remaining) {
        hasEnoughBalance = false;
        balanceMessage = `Insufficient casual leave balance. You have ${remaining} days remaining.`;
      }
    }

    if (!hasEnoughBalance) {
      alert(balanceMessage);
      return;
    }

    // Update leave balance
    if (leaveType === 'annual') {
      employee.annualLeave.used += leaveDays;
    } else if (leaveType === 'casual') {
      employee.casualLeave.used += leaveDays;
    } else if (leaveType === 'sick') {
      employee.sickLeave.used += leaveDays;
    }

    // Add to history
    employee.leaveHistory.unshift({
      date: new Date().toISOString().split('T')[0],
      type: leaveType,
      days: leaveDays,
      reason: leaveReason,
      status: 'approved'
    });

    setEmployees(updatedEmployees);
    setLeaveReason('');
    setLeaveDays(1);
    alert('Leave request submitted successfully!');
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-800';
      case 'casual': return 'bg-orange-100 text-orange-800';
      case 'sick': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (used, total) => {
    const percentage = (used / total) * 100;
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const selectedEmployeeData = employees.find(emp => emp.id.toString() === selectedEmployee);

  // Registration Screen
  if (showRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="text-green-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Employee Registration</h1>
            <p className="text-gray-600">Create your employee account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={registrationForm.firstName}
                onChange={(e) => setRegistrationForm({...registrationForm, firstName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={registrationForm.lastName}
                onChange={(e) => setRegistrationForm({...registrationForm, lastName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={registrationForm.startDate}
                onChange={(e) => setRegistrationForm({...registrationForm, startDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEmployeeRegistration}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Register
              </button>
              <button
                onClick={() => setShowRegistration(false)}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Registration Info:</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Your username will be: firstname.lastname</p>
              <p>• Your password will be: <strong>bolder</strong></p>
              <p>• Please remember these credentials for login</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Employee Leave System</h1>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username (firstname.lastname)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={loginForm.showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setLoginForm({...loginForm, showPassword: !loginForm.showPassword})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {loginForm.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </button>

            <button
              onClick={() => setShowRegistration(true)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Register as New Employee
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Login Information:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Employees:</strong> Use firstname.lastname with password: bolder</p>
              <p><strong>HR:</strong> Username: hr, Password: hr123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome Dashboard for Employees
  const WelcomeDashboard = () => {
    if (userRole !== 'employee' || !selectedEmployeeData) return null;

    const annualRemaining = selectedEmployeeData.annualLeave.total - selectedEmployeeData.annualLeave.used;
    const casualRemaining = selectedEmployeeData.casualLeave.total - selectedEmployeeData.casualLeave.used;
    const sickRemaining = selectedEmployeeData.sickLeave.total - selectedEmployeeData.sickLeave.used;

    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {currentUser}!</h2>
            <p className="text-blue-100">Here's your leave balance summary</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} />
              <h3 className="font-semibold">Annual Leave</h3>
            </div>
            <p className="text-2xl font-bold">{annualRemaining}</p>
            <p className="text-sm text-blue-100">days remaining</p>
          </div>
          
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} />
              <h3 className="font-semibold">Casual Leave</h3>
            </div>
            <p className="text-2xl font-bold">{casualRemaining}</p>
            <p className="text-sm text-blue-100">days remaining</p>
          </div>
          
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} />
              <h3 className="font-semibold">Sick Leave</h3>
            </div>
            <p className="text-2xl font-bold">{sickRemaining}</p>
            <p className="text-sm text-blue-100">days remaining</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Employee Leave Management System</h1>
              <p className="text-gray-600">Welcome, {currentUser} ({userRole === 'hr' ? 'HR Administrator' : 'Employee'})</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Welcome Dashboard for Employees */}
        <WelcomeDashboard />

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('request')}
            className={`pb-2 px-4 font-medium ${activeTab === 'request' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            {userRole === 'employee' ? 'My Leave Request' : 'Request Leave'}
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-4 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            {userRole === 'employee' ? 'My Leave Overview' : 'Leave Overview'}
          </button>
          {userRole === 'hr' && (
            <button
              onClick={() => setActiveTab('employees')}
              className={`pb-2 px-4 font-medium ${activeTab === 'employees' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            >
              Manage Employees
            </button>
          )}
        </div>

        {/* HR: Manage Employees Tab */}
        {userRole === 'hr' && activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="text-blue-600" size={20} />
                Add New Employee
              </h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter employee full name"
                  />
                </div>
                <button
                  onClick={addEmployee}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Employee
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">All Employees ({employees.length})</h3>
              {employees.map(employee => (
                <div key={employee.id} className="bg-gray-50 p-4 rounded-lg">
                  {editingEmployee === employee.id ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={editForm.startDate}
                            onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditEmployee}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Save
                        </button>
                        <button
                          onClick={cancelEditEmployee}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800">{employee.name}</h4>
                        <p className="text-sm text-gray-600">Username: {employee.username}</p>
                        <p className="text-sm text-gray-600">Started: {employee.startDate}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <div>Annual: {employee.annualLeave.used}/{employee.annualLeave.total} days</div>
                          <div>Casual: {employee.casualLeave.used}/{employee.casualLeave.total} days</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditEmployee(employee)}
                            className="bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 transition-colors"
                            title="Edit Employee"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteEmployee(employee.id)}
                            className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leave Request Tab */}
        {activeTab === 'request' && (
          <div className="space-y-6">
            {userRole === 'hr' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose an employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="annual">Annual Leave (24 days/year)</option>
                  <option value="casual">Casual Leave (7 days/year)</option>
                  <option value="sick">Sick Leave (180 days/year)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Days
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLeaveDays(Math.max(1, leaveDays - 1))}
                    className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 p-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setLeaveDays(leaveDays + 1)}
                    className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leave
              </label>
              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter the reason for your leave request"
              />
            </div>

            <button
              onClick={submitLeaveRequest}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={!selectedEmployee || !leaveReason.trim()}
            >
              Submit Leave Request
            </button>
          </div>
        )}

        {/* Leave Overview Tab */}
        {activeTab === 'overview' && selectedEmployeeData && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Annual Leave</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {selectedEmployeeData.annualLeave.used}/{selectedEmployeeData.annualLeave.total}
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedEmployeeData.annualLeave.total - selectedEmployeeData.annualLeave.used} days remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getProgressColor(selectedEmployeeData.annualLeave.used, selectedEmployeeData.annualLeave.total)}`}
                    style={{ width: `${(selectedEmployeeData.annualLeave.used / selectedEmployeeData.annualLeave.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Casual Leave</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {selectedEmployeeData.casualLeave.used}/{selectedEmployeeData.casualLeave.total}
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedEmployeeData.casualLeave.total - selectedEmployeeData.casualLeave.used} days remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getProgressColor(selectedEmployeeData.casualLeave.used, selectedEmployeeData.casualLeave.total)}`}
                    style={{ width: `${(selectedEmployeeData.casualLeave.used / selectedEmployeeData.casualLeave.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Sick Leave</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {selectedEmployeeData.sickLeave.used}/{selectedEmployeeData.sickLeave.total}
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedEmployeeData.sickLeave.total - selectedEmployeeData.sickLeave.used} days remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getProgressColor(selectedEmployeeData.sickLeave.used, selectedEmployeeData.sickLeave.total)}`}
                    style={{ width: `${(selectedEmployeeData.sickLeave.used / selectedEmployeeData.sickLeave.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Leave History</h3>
              {selectedEmployeeData.leaveHistory.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  No leave history found
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEmployeeData.leaveHistory.map((leave, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${leave.status === 'approved' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.type)}`}>
                            {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                          </span>
                          <h4 className="font-medium mt-2">{leave.reason}</h4>
                          <p className="text-sm text-gray-600">{leave.days} day(s) on {leave.date}</p>
                        </div>
                        {leave.status === 'approved' ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={16} />
                            Approved
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <AlertCircle size={16} />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveTracker;
