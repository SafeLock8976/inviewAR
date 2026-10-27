import React, { useState, useRef, useEffect } from 'react';
import { 
  Sofa, Lamp, TreePine, Tv, Save, Monitor, Bed, 
  ArrowLeft, Camera, LayoutDashboard, Lock, Mail, 
  ChevronRight, Box, RotateCw, RotateCcw, Palette, 
  Share2, Upload, User, Briefcase, CheckCircle, 
  MessageSquare, Plus, Trash2, Eye, Download, 
  Layers, Sliders, RefreshCw, X
} from 'lucide-react';
import './index.css';
import '@google/model-viewer';

const MODELS_3D = [
  { id: 'chair', name: 'Modern Chair', url: '/models/modern_chair.glb', icon: Sofa, category: 'Seating' },
  { id: 'sofa', name: 'Luxury Sofa', url: '/models/sofa.glb', icon: Sofa, category: 'Living' },
  { id: 'table', name: 'Coffee Table', url: '/models/table.glb', icon: Monitor, category: 'Living' },
  { id: 'tv', name: 'Smart TV', url: '/models/tv.glb', icon: Tv, category: 'Electronics' },
  { id: 'fridge', name: 'Refrigerator', url: '/models/fridge.glb', icon: Box, category: 'Kitchen' },
  { id: 'washing_machine', name: 'Washing Machine', url: '/models/washing_machine.glb', icon: Box, category: 'Appliances' },
  { id: 'mixer', name: 'Kitchen Mixer', url: 'https://modelviewer.dev/assets/ShopifyModels/Mixer.glb', icon: Box, category: 'Kitchen' },
  { id: 'planter', name: 'Geo Planter', url: 'https://modelviewer.dev/assets/ShopifyModels/GeoPlanter.glb', icon: TreePine, category: 'Decor' },
  { id: 'astronaut', name: 'Astronaut Figurine', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', icon: Box, category: 'Decor' }
];

const ITEMS_2D = [
  { id: 'sofa_2d', name: 'Sofa', icon: Sofa, width: 120, height: 60, color: '#4f46e5' },
  { id: 'lamp_2d', name: 'Floor Lamp', icon: Lamp, width: 40, height: 40, color: '#fbbf24' },
  { id: 'plant_2d', name: 'Fiddle Plant', icon: TreePine, width: 50, height: 50, color: '#22c55e' },
  { id: 'tv_2d', name: 'TV Unit', icon: Tv, width: 90, height: 25, color: '#1f2937' },
  { id: 'bed_2d', name: 'King Bed', icon: Bed, width: 140, height: 160, color: '#db2777' },
  { id: 'desk_2d', name: 'Work Desk', icon: Monitor, width: 100, height: 60, color: '#d97706' },
];

const WALL_COLORS = [
  { name: 'Clean White', value: '#ffffff' },
  { name: 'Warm Cream', value: '#fdf6e2' },
  { name: 'Modern Slate', value: '#94a3b8' },
  { name: 'Sage Green', value: '#a3b18a' },
  { name: 'Terracotta', value: '#dd7a5f' },
  { name: 'Navy Accent', value: '#334155' }
];

const INITIAL_REQUESTS = [
  {
    id: 1,
    userName: 'Sundhar',
    userEmail: 'sundhar@example.com',
    roomType: 'Living Room',
    style: 'Modern Minimalist',
    budget: '$2,500',
    notes: 'Looking for a warm minimalist vibe with comfortable sofa and coffee table.',
    photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    status: 'Pending',
    designerProposal: null
  },
  {
    id: 2,
    userName: 'Emily Watson',
    userEmail: 'emily@example.com',
    roomType: 'Master Bedroom',
    style: 'Scandinavian Cozy',
    budget: '$1,800',
    notes: 'Need relaxing lighting, wood accents, and cozy reading corner.',
    photo: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80',
    status: 'Revamped by Designer',
    designerProposal: {
      designerName: 'Arch. Sarah Jenkins',
      feedback: 'Suggested light oak tones with sage wall palette and low-profile modern chair.',
      recommendedColors: ['#a3b18a', '#fdf6e2'],
      recommendedModels: ['Modern Chair', 'Geo Planter']
    }
  }
];

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard'); // 'login', 'dashboard', 'design-space', 'ar-view', 'hire-designer', 'designer-portal'
  const [userRole, setUserRole] = useState('user'); // 'user' or 'designer'
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [userName, setUserName] = useState('Sundhar');

  // Design Space State
  const [placedItems, setPlacedItems] = useState([]);
  const canvasRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [movingItem, setMovingItem] = useState(null);
  const [roomWallColor, setRoomWallColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(true);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  // Camera & AR View State
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [cameraError, setCameraError] = useState(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [active3DModel, setActive3DModel] = useState(MODELS_3D[0]);
  const [arWallColor, setArWallColor] = useState('transparent');
  const [showControlsDrawer, setShowControlsDrawer] = useState(true);

  // 3D Model Transform Controls (Pitch, Yaw, Roll, Scale)
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(0);
  const [modelScale, setModelScale] = useState(1);

  // Designer Marketplace State
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proposalNotes, setProposalNotes] = useState('');
  const [newRequest, setNewRequest] = useState({
    roomType: 'Living Room',
    style: 'Modern Minimalist',
    budget: '$2,000',
    notes: '',
    photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
  });

  // Start Camera for AR with full mobile support & fallbacks
  const startCamera = async (facing = cameraFacing) => {
    setIsCameraStarting(true);
    setCameraError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera API requires a secure HTTPS connection. Please access via the HTTPS link.");
      }

      // Stop existing tracks if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (constraintErr) {
        console.warn("Retrying camera with generic constraint...", constraintErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      setStream(mediaStream);
      setCameraFacing(facing);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video playback warning:", playErr);
        }
      }
    } catch (err) {
      console.warn("Camera could not be accessed directly:", err);
      let msg = "Camera permission was denied or camera is unavailable.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Camera permission was blocked. Please tap 'Allow' when prompted or enable Camera in browser settings.";
      } else if (!window.isSecureContext) {
        msg = "Camera requires a secure HTTPS connection. Please use the HTTPS link.";
      }
      setCameraError(msg);
    } finally {
      setIsCameraStarting(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (currentScreen === 'ar-view') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [currentScreen]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.log('Autoplay play error:', e));
    }
  }, [stream, currentScreen]);

  // Drag and drop handlers for 2D catalog items
  const handleDragStartFromMenu = (e, item) => {
    setDraggedItem(item);
  };

  const handleDropOnCanvas = (e) => {
    e.preventDefault();
    if (!canvasRef.current || !draggedItem) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(rect.width - draggedItem.width - 10, e.clientX - rect.left - (draggedItem.width / 2)));
    const y = Math.max(10, Math.min(rect.height - draggedItem.height - 10, e.clientY - rect.top - (draggedItem.height / 2)));

    setPlacedItems([
      ...placedItems,
      {
        ...draggedItem,
        type: '2d',
        uniqueId: Date.now() + Math.random(),
        x,
        y,
        rotation: 0
      }
    ]);
    setDraggedItem(null);
  };

  // Click handler to instantly add 3D Model to canvas
  const handleAdd3DToCanvas = (model) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const width = 140;
    const height = 140;
    setPlacedItems([
      ...placedItems,
      {
        ...model,
        type: '3d',
        uniqueId: Date.now() + Math.random(),
        x: (rect.width / 2) - (width / 2) + (Math.random() * 40 - 20),
        y: (rect.height / 2) - (height / 2) + (Math.random() * 40 - 20),
        width,
        height,
        rotation: 0,
        color: '#6366f1'
      }
    ]);
  };

  // Pointer dragging items on Canvas
  const handlePointerDownCanvasItem = (e, item) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setMovingItem({
      ...item,
      startX: e.clientX,
      startY: e.clientY,
      initX: item.x,
      initY: item.y,
      pointerId: e.pointerId
    });
  };

  const handlePointerMove = (e) => {
    if (!movingItem || !canvasRef.current) return;
    const dx = e.clientX - movingItem.startX;
    const dy = e.clientY - movingItem.startY;
    const rect = canvasRef.current.getBoundingClientRect();

    const newX = Math.max(0, Math.min(rect.width - movingItem.width, movingItem.initX + dx));
    const newY = Math.max(0, Math.min(rect.height - movingItem.height, movingItem.initY + dy));

    setPlacedItems(placedItems.map(i => 
      i.uniqueId === movingItem.uniqueId ? { ...i, x: newX, y: newY } : i
    ));
  };

  const handlePointerUp = (e) => {
    if (movingItem) {
      try {
        e.currentTarget?.releasePointerCapture(movingItem.pointerId);
      } catch (err) {}
      setMovingItem(null);
    }
  };

  const rotateItem = (uniqueId, e) => {
    e.stopPropagation();
    setPlacedItems(placedItems.map(i => 
      i.uniqueId === uniqueId ? { ...i, rotation: (i.rotation + 45) % 360 } : i
    ));
  };

  const deleteItem = (uniqueId, e) => {
    e.stopPropagation();
    setPlacedItems(placedItems.filter(i => i.uniqueId !== uniqueId));
  };

  // Presets for 3D orientation
  const applyPresetAngle = (x, y, z) => {
    setRotX(x);
    setRotY(y);
    setRotZ(z);
  };

  // Handle submitting room request to designers
  const handleSubmitDesignRequest = (e) => {
    e.preventDefault();
    const req = {
      id: Date.now(),
      userName: userName || 'Sundhar',
      userEmail: userEmail || 'user@example.com',
      ...newRequest,
      status: 'Pending',
      designerProposal: null
    };
    setRequests([req, ...requests]);
    alert("✨ Your room photo has been uploaded! Professional designers have been notified.");
    setCurrentScreen('dashboard');
  };

  // Designer submits revamp proposal
  const handleSubmitProposal = (requestId) => {
    if (!proposalNotes.trim()) {
      alert("Please enter design suggestions or feedback.");
      return;
    }
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Revamped by Designer',
          designerProposal: {
            designerName: userName || 'Arch. Sarah Jenkins',
            feedback: proposalNotes,
            recommendedColors: ['#a3b18a', '#94a3b8'],
            recommendedModels: ['Luxury Sofa', 'Coffee Table']
          }
        };
      }
      return req;
    }));
    setSelectedRequest(null);
    setProposalNotes('');
    alert("🎉 Design proposal published and sent to the client!");
  };

  /* ================= 1. LOGIN SCREEN ================= */
  const renderLogin = () => (
    <div className="login-screen">
      <div className="login-blob"></div>
      <div className="login-card">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>
          <div className="logo-icon large"></div>
          <h1>SnapeDesign</h1>
        </div>
        <p className="subtitle">AR Interior Design & Professional Decor Studio</p>

        <div className="role-tabs">
          <button 
            type="button"
            className={`role-tab ${userRole === 'user' ? 'active' : ''}`}
            onClick={() => setUserRole('user')}
          >
            <User size={16} />
            <span>Client / User</span>
          </button>
          <button 
            type="button"
            className={`role-tab ${userRole === 'designer' ? 'active' : ''}`}
            onClick={() => setUserRole('designer')}
          >
            <Briefcase size={16} />
            <span>Pro Designer</span>
          </button>
        </div>

        <form className="login-form" onSubmit={(e) => { e.preventDefault(); setCurrentScreen('dashboard'); }}>
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={userEmail} 
              onChange={(e) => setUserEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input type="password" placeholder="Password" defaultValue="password123" required />
          </div>
          <button type="submit" className="primary-btn full-width">
            Sign In as {userRole === 'designer' ? 'Designer' : 'User'}
          </button>
        </form>
      </div>
    </div>
  );

  /* ================= 2. DASHBOARD SCREEN ================= */
  const renderDashboard = () => (
    <div className="dashboard-screen">
      <header className="dash-header">
        <div className="brand">
          <div className="logo-icon"></div>
          <h2>SnapeDesign</h2>
        </div>
        <div className="dash-user-badge">
          <span className={`role-pill ${userRole}`}>
            {userRole === 'designer' ? 'Professional Designer' : 'Homeowner / User'}
          </span>
          <button 
            className="secondary-btn"
            onClick={() => setUserRole(userRole === 'user' ? 'designer' : 'user')}
            title="Switch Account Role"
          >
            <RefreshCw size={14} />
            Switch to {userRole === 'user' ? 'Designer' : 'User'}
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setCurrentScreen('login')}
            title="Logout"
          >
            <User size={18} />
          </button>
        </div>
      </header>

      <div className="dash-content">
        <h1 className="dash-title">Welcome back, {userName || 'Creator'}!</h1>
        <p className="dash-subtitle">What would you like to design or explore today?</p>

        <div className="options-grid">
          {/* Card 1: 2D & 3D Design Space */}
          <div className="option-card" onClick={() => setCurrentScreen('design-space')}>
            <div className="card-icon gradient-1">
              <LayoutDashboard size={30} color="white" />
            </div>
            <div className="card-text">
              <h3>Design Space (2D & 3D)</h3>
              <p>Arrange furniture, drop interactive 3D models from the right sidebar, and tweak wall colors.</p>
            </div>
            <div className="card-arrow">
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Card 2: AR View */}
          <div className="option-card" onClick={() => setCurrentScreen('ar-view')}>
            <div className="card-icon gradient-2">
              <Camera size={30} color="white" />
            </div>
            <div className="card-text">
              <h3>In View AR</h3>
              <p>Point camera at your room, place 3D furniture, rotate at ANY angle with 360° controls, and preview wall paint.</p>
            </div>
            <div className="card-arrow">
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Card 3: Hire Designer */}
          <div className="option-card" onClick={() => setCurrentScreen('hire-designer')}>
            <div className="card-icon gradient-3">
              <Upload size={30} color="white" />
            </div>
            <div className="card-text">
              <h3>Hire a Designer</h3>
              <p>Upload room photos, specify your dream style, and get custom design revamps from top interior designers.</p>
            </div>
            <div className="card-arrow">
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Card 4: Designer Workspace */}
          <div className="option-card" onClick={() => setCurrentScreen('designer-portal')}>
            <div className="card-icon gradient-4">
              <Briefcase size={30} color="white" />
            </div>
            <div className="card-text">
              <h3>Designer Marketplace</h3>
              <p>Review customer room photos, submit customized redesign proposals, and recommend 3D furniture.</p>
            </div>
            <div className="card-arrow">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ================= 3. AR CAMERA VIEW SCREEN ================= */
  const renderARView = () => (
    <div className="ar-screen">
      <header className="ar-header">
        <button className="icon-btn dark" onClick={() => setCurrentScreen('dashboard')}>
          <ArrowLeft size={20} color="white" />
        </button>
        <span className="ar-title">In View AR • Real Room View</span>
        <div className="ar-header-actions">
          {stream && (
            <button 
              className="icon-btn dark" 
              onClick={toggleCameraFacing}
              title={`Switch Camera (Currently ${cameraFacing === 'environment' ? 'Rear' : 'Front'})`}
            >
              <RefreshCw size={18} color="white" />
            </button>
          )}
          <button 
            className="icon-btn dark" 
            onClick={() => setShowControlsDrawer(!showControlsDrawer)}
            title="Toggle 3D Angle Sliders"
          >
            <Sliders size={18} color="white" />
          </button>
          <button 
            className="icon-btn dark" 
            onClick={() => alert("📸 Snapshot captured! Saved to your interior portfolio.")}
            title="Save Snapshot"
          >
            <Camera size={18} color="white" />
          </button>
        </div>
      </header>

      <div className="ar-viewport">
        {/* Real camera video feed or realistic room simulation fallback */}
        {stream ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="real-camera-feed" 
              onLoadedMetadata={(e) => e.target.play().catch(console.error)}
            />
            <div className="ar-camera-badge">
              <span className="live-dot"></span>
              Live Room Camera ({cameraFacing === 'environment' ? 'Rear' : 'Front'})
            </div>
          </>
        ) : (
          <div 
            className="camera-feed-sim" 
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')` 
            }}
          >
            <div className="camera-enable-card">
              <Camera size={34} color="#818cf8" />
              <h4 style={{ margin: '8px 0 4px', color: '#f8fafc', fontSize: '1rem' }}>
                {cameraError ? 'Camera Access Required' : 'See In Your Actual Room'}
              </h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.8rem', textAlign: 'center', margin: '4px 0 14px', maxWidth: 280 }}>
                {cameraError || 'Activate your phone camera to see the 3D model placed directly in your real room background.'}
              </p>
              <button 
                className="btn-enable-camera" 
                onClick={() => startCamera(cameraFacing)}
                disabled={isCameraStarting}
              >
                {isCameraStarting ? 'Connecting Camera...' : '📷 Turn On Room Camera'}
              </button>
              <div style={{ marginTop: 10, fontSize: '0.72rem', color: '#94a3b8' }}>
                Or interact with 3D model over simulated backdrop
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Wall Color Tint Overlay */}
        {arWallColor !== 'transparent' && (
          <div 
            className="wall-tint-overlay" 
            style={{ backgroundColor: arWallColor }}
          />
        )}

        {/* 3D Model with Orientation Attributes */}
        <div className="ar-model-overlay">
          <model-viewer
            src={active3DModel.url}
            alt={active3DModel.name}
            camera-controls
            touch-action="pan-y"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
            ar-placement="floor"
            className="model-viewer-element"
            shadow-intensity="1.5"
            exposure="1.1"
            orientation={`${rotX}deg ${rotY}deg ${rotZ}deg`}
            scale={`${modelScale} ${modelScale} ${modelScale}`}
          >
            <button slot="ar-button" className="btn-activate-ar">
              📱 In View AR (Real Room)
            </button>
          </model-viewer>
        </div>

        {/* Floating 3D Angle Controls Drawer */}
        {showControlsDrawer && (
          <div className="ar-controls-drawer">
            <div className="drawer-header">
              <h4><Sliders size={16} /> 3D Angle & Wall Paint</h4>
              <button 
                onClick={() => setShowControlsDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Angle Presets */}
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>Quick Angle Presets:</div>
            <div className="angle-presets">
              <button className="preset-chip" onClick={() => applyPresetAngle(0, 0, 0)}>Front</button>
              <button className="preset-chip" onClick={() => applyPresetAngle(90, 0, 0)}>Top 90°</button>
              <button className="preset-chip" onClick={() => applyPresetAngle(0, 90, 0)}>Side 90°</button>
              <button className="preset-chip" onClick={() => applyPresetAngle(30, 45, 0)}>Tilt 45°</button>
              <button className="preset-chip" onClick={() => applyPresetAngle(0, 180, 0)}>Floor Flat</button>
              <button className="preset-chip" onClick={() => { applyPresetAngle(0, 0, 0); setModelScale(1); }}>Reset</button>
            </div>

            {/* X, Y, Z Rotation Sliders */}
            <div className="axis-slider-row">
              <span className="axis-label x">X</span>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={rotX} 
                onChange={(e) => setRotX(Number(e.target.value))} 
              />
              <span className="axis-val">{rotX}°</span>
            </div>

            <div className="axis-slider-row">
              <span className="axis-label y">Y</span>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={rotY} 
                onChange={(e) => setRotY(Number(e.target.value))} 
              />
              <span className="axis-val">{rotY}°</span>
            </div>

            <div className="axis-slider-row">
              <span className="axis-label z">Z</span>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={rotZ} 
                onChange={(e) => setRotZ(Number(e.target.value))} 
              />
              <span className="axis-val">{rotZ}°</span>
            </div>

            {/* Scale Slider */}
            <div className="axis-slider-row" style={{ marginTop: 6 }}>
              <span style={{ fontSize: '0.8rem', width: 40, color: '#cbd5e1' }}>Scale</span>
              <input 
                type="range" 
                min="0.5" 
                max="2.5" 
                step="0.1" 
                value={modelScale} 
                onChange={(e) => setModelScale(Number(e.target.value))} 
              />
              <span className="axis-val">{modelScale}x</span>
            </div>

            {/* Wall Paint Preview in AR */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>Change Wall Color:</div>
              <div className="wall-color-bar">
                <div 
                  className={`color-dot ${arWallColor === 'transparent' ? 'active' : ''}`}
                  style={{ background: '#475569' }}
                  onClick={() => setArWallColor('transparent')}
                  title="No Tint"
                />
                {WALL_COLORS.map(c => (
                  <div 
                    key={c.name}
                    className={`color-dot ${arWallColor === c.value ? 'active' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => setArWallColor(c.value)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom 3D Model Carousel */}
        <div className="model-selector-bar">
          {MODELS_3D.map(model => {
            const Icon = model.icon;
            const isSelected = active3DModel.id === model.id;
            return (
              <button 
                key={model.id} 
                className={`model-btn ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setActive3DModel(model);
                }}
              >
                <Icon size={20} />
                <span>{model.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ================= 4. DESIGN SPACE SCREEN ================= */
  const renderDesignSpace = () => (
    <div className="app-container" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <header className="header">
        <div className="header-left">
          <button className="icon-btn" onClick={() => setCurrentScreen('dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <div className="brand" style={{ marginLeft: '8px' }}>
            <div className="logo-icon small"></div>
            <h1>SnapeDesign Studio</h1>
          </div>
        </div>

        <div className="header-right">
          <button className="secondary-btn" onClick={() => setPlacedItems([])}>
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
          <button className="primary-btn" onClick={() => setSaveModalOpen(true)}>
            <Save size={16} />
            <span>Save & Share</span>
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Left Sidebar: 2D Furniture Catalog */}
        <aside className="sidebar">
          <h2>2D Catalog</h2>
          <p>Drag items directly onto room floor</p>
          <div className="catalog-grid">
            {ITEMS_2D.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id} 
                  className="catalog-item"
                  draggable
                  onDragStart={(e) => handleDragStartFromMenu(e, item)}
                >
                  <Icon color={item.color} size={28} strokeWidth={1.75} />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Room Canvas */}
        <section className="canvas-area">
          <div className="canvas-toolbar">
            <div className="toolbar-group">
              <span className="toolbar-label">Wall Paint:</span>
              <div className="wall-color-bar" style={{ marginTop: 0 }}>
                {WALL_COLORS.map(c => (
                  <div 
                    key={c.name}
                    className={`color-dot ${roomWallColor === c.value ? 'active' : ''}`}
                    style={{ background: c.value, width: 22, height: 22 }}
                    onClick={() => setRoomWallColor(c.value)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="toolbar-group">
              <button 
                className="secondary-btn" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setShowGrid(!showGrid)}
              >
                <Layers size={14} />
                {showGrid ? 'Hide Grid' : 'Show Grid'}
              </button>
            </div>
          </div>

          <div 
            className="canvas-wrapper" 
            style={{ backgroundColor: roomWallColor }}
          >
            <div 
              className="canvas" 
              ref={canvasRef}
              onDrop={handleDropOnCanvas}
              onDragOver={(e) => e.preventDefault()}
            >
              {showGrid && <div className="grid-pattern"></div>}

              {placedItems.length === 0 && (
                <div className="canvas-placeholder">
                  <LayoutDashboard size={40} style={{ opacity: 0.4 }} />
                  <div>Drag 2D furniture from the left or click 3D models on the right!</div>
                </div>
              )}

              {placedItems.map(item => {
                const Icon = item.icon;
                const is3D = item.type === '3d';

                return (
                  <div 
                    key={item.uniqueId}
                    className={`placed-item ${is3D ? 'is-3d' : ''}`}
                    style={{
                      left: item.x,
                      top: item.y,
                      width: item.width,
                      height: item.height,
                      backgroundColor: is3D ? '#ffffff' : `${item.color}25`,
                      borderColor: item.color || '#6366f1',
                      transform: `rotate(${item.rotation}deg)`
                    }}
                    onPointerDown={(e) => handlePointerDownCanvasItem(e, item)}
                  >
                    {is3D ? (
                      <>
                        <div className="item-drag-handle">
                          <span>3D {item.name}</span>
                          <span style={{ fontSize: '0.65rem' }}>{item.rotation}°</span>
                        </div>
                        <div style={{ flex: 1, width: '100%', height: '100%', pointerEvents: 'none' }}>
                          <model-viewer
                            src={item.url}
                            alt={item.name}
                            auto-rotate="true"
                            interaction-prompt="none"
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      </>
                    ) : (
                      <Icon color={item.color} size={28} />
                    )}

                    <div className="item-controls">
                      <button 
                        className="control-btn" 
                        onPointerDown={(e) => e.stopPropagation()} 
                        onClick={(e) => rotateItem(item.uniqueId, e)}
                        title="Rotate 45°"
                      >
                        ↻
                      </button>
                      <button 
                        className="control-btn delete-btn" 
                        onPointerDown={(e) => e.stopPropagation()} 
                        onClick={(e) => deleteItem(item.uniqueId, e)}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Sidebar: 3D Models Library */}
        <aside className="sidebar right-sidebar">
          <h2>3D Models Library</h2>
          <p>Click any model to place it directly into your room</p>
          <div className="catalog-grid">
            {MODELS_3D.map((model) => {
              const Icon = model.icon;
              return (
                <div 
                  key={model.id} 
                  className="catalog-item badge-3d"
                  onClick={() => handleAdd3DToCanvas(model)}
                  title={`Add 3D ${model.name}`}
                >
                  <Icon color="#6366f1" size={28} strokeWidth={1.75} />
                  <span>{model.name}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="modal-backdrop" onClick={() => setSaveModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={22} color="#10b981" />
              Room Layout Saved!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
              Your space has {placedItems.length} items configured with {roomWallColor} wall finish.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="secondary-btn" onClick={() => setSaveModalOpen(false)}>Close</button>
              <button 
                className="primary-btn" 
                onClick={() => {
                  alert("Link copied to clipboard! Anyone with this link can view your 3D design.");
                  setSaveModalOpen(false);
                }}
              >
                <Share2 size={16} /> Share Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ================= 5. HIRE A DESIGNER SCREEN ================= */
  const renderHireDesigner = () => (
    <div className="designer-view-container">
      <header className="portal-header">
        <div className="brand">
          <button className="icon-btn" onClick={() => setCurrentScreen('dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <h2>Hire a Professional Designer</h2>
        </div>
      </header>

      <div className="portal-content">
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, padding: 32, marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Step 1: Upload Your Room Photo</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
            Take or upload a picture of your current room so interior designers can analyze its lighting and dimensions.
          </p>

          <div className="photo-upload-box" onClick={() => alert("Camera / Photo Picker opened! Selected demo room photo.")}>
            <img 
              src={newRequest.photo} 
              alt="Room Preview" 
              style={{ maxHeight: 220, borderRadius: 12, marginBottom: 12, objectFit: 'cover' }} 
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4f46e5', fontWeight: 600 }}>
              <Camera size={18} />
              <span>Tap to Change or Retake Photo</span>
            </div>
          </div>

          <form onSubmit={handleSubmitDesignRequest} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Room Type</label>
                <div className="input-group">
                  <select 
                    value={newRequest.roomType} 
                    onChange={(e) => setNewRequest({ ...newRequest, roomType: e.target.value })}
                  >
                    <option>Living Room</option>
                    <option>Master Bedroom</option>
                    <option>Modern Kitchen</option>
                    <option>Home Office</option>
                    <option>Balcony / Patio</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Preferred Aesthetic</label>
                <div className="input-group">
                  <select 
                    value={newRequest.style} 
                    onChange={(e) => setNewRequest({ ...newRequest, style: e.target.value })}
                  >
                    <option>Modern Minimalist</option>
                    <option>Scandinavian Warmth</option>
                    <option>Contemporary Luxury</option>
                    <option>Industrial Loft</option>
                    <option>Bohemian Chic</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Estimated Decor Budget</label>
              <div className="input-group">
                <input 
                  type="text" 
                  value={newRequest.budget} 
                  onChange={(e) => setNewRequest({ ...newRequest, budget: e.target.value })}
                  placeholder="e.g. $2,000 - $3,500" 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Design Goals & Special Requests</label>
              <div className="input-group">
                <textarea 
                  rows={3} 
                  value={newRequest.notes} 
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                  placeholder="Tell designers what you love (e.g. warm wood tones, pet-friendly fabric, cozy lighting...)"
                />
              </div>
            </div>

            <button type="submit" className="primary-btn full-width" style={{ marginTop: 8 }}>
              🚀 Upload Room & Notify Designers
            </button>
          </form>
        </div>

        {/* Previous Submissions & Received Proposals */}
        <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Your Submitted Requests & Proposals</h3>
        {requests.map(req => (
          <div key={req.id} className="request-card">
            <img src={req.photo} alt={req.roomType} className="request-photo-thumb" />
            <div className="request-details">
              <span className={`request-badge ${req.status === 'Revamped by Designer' ? 'approved' : ''}`}>
                {req.status}
              </span>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{req.roomType} • {req.style}</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8 }}>
                Budget: {req.budget} • Notes: "{req.notes || 'None'}"
              </p>

              {req.designerProposal && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, marginTop: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#4f46e5', marginBottom: 4 }}>
                    💬 Proposal from {req.designerProposal.designerName}:
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155' }}>{req.designerProposal.feedback}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ================= 6. DESIGNER WORKSPACE SCREEN ================= */
  const renderDesignerPortal = () => (
    <div className="designer-view-container">
      <header className="portal-header">
        <div className="brand">
          <button className="icon-btn" onClick={() => setCurrentScreen('dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <h2>Designer Marketplace • Client Feed</h2>
        </div>
        <span className="role-pill designer">Designer Workspace</span>
      </header>

      <div className="portal-content">
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.95rem' }}>
          Browse user-uploaded room photos, review requested aesthetics, and send back revamped design suggestions and 3D furniture picks.
        </p>

        {requests.map(req => (
          <div key={req.id} className="request-card">
            <img src={req.photo} alt={req.roomType} className="request-photo-thumb" />
            <div className="request-details">
              <span className={`request-badge ${req.status === 'Revamped by Designer' ? 'approved' : ''}`}>
                {req.status}
              </span>
              <h4 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{req.roomType} for {req.userName}</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 6 }}>
                Target Style: <strong>{req.style}</strong> • Budget: <strong>{req.budget}</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 12 }}>
                Client Brief: "{req.notes || 'Looking for an aesthetic transformation.'}"
              </p>

              <button 
                className="primary-btn" 
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => setSelectedRequest(req)}
              >
                <MessageSquare size={14} /> Review & Submit Design Revamp
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Designer Revamp Modal */}
      {selectedRequest && (
        <div className="modal-backdrop" onClick={() => setSelectedRequest(null)}>
          <div className="modal-card" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>
              Revamp Design for {selectedRequest.userName}'s {selectedRequest.roomType}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 16 }}>
              Target Style: {selectedRequest.style} • Budget: {selectedRequest.budget}
            </p>

            <img 
              src={selectedRequest.photo} 
              alt="Room" 
              style={{ width: '100%', maxHeight: 180, borderRadius: 12, objectFit: 'cover', marginBottom: 16 }} 
            />

            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Your Professional Recommendations & Decor Notes:
            </label>
            <textarea 
              rows={4}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', marginBottom: 16 }}
              placeholder="e.g. Recommended switching sofa to our Luxury Sofa 3D model, adding Sage wall paint, and placing the Coffee Table at center..."
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="secondary-btn" onClick={() => setSelectedRequest(null)}>Cancel</button>
              <button 
                className="primary-btn" 
                onClick={() => handleSubmitProposal(selectedRequest.id)}
              >
                Post Revamp to Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {currentScreen === 'login' && renderLogin()}
      {currentScreen === 'dashboard' && renderDashboard()}
      {currentScreen === 'design-space' && renderDesignSpace()}
      {currentScreen === 'ar-view' && renderARView()}
      {currentScreen === 'hire-designer' && renderHireDesigner()}
      {currentScreen === 'designer-portal' && renderDesignerPortal()}
    </>
  );
}

export default App;
