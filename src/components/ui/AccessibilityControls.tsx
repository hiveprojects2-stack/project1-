import React, { useState, useEffect } from 'react';
import { Settings, Type, Palette, Eye, Volume2, MousePointer, Keyboard, Sun, Moon, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';

interface AccessibilitySettings {
  fontSize: number;
  theme: 'light' | 'dark' | 'high-contrast';
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  textSpacing: number;
  cursorSize: number;
}

interface AccessibilityControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    theme: 'light',
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    colorBlindMode: 'none',
    textSpacing: 100,
    cursorSize: 100
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Apply settings to document
    applySettings(settings);
    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${newSettings.fontSize}%`;
    
    // Theme
    root.setAttribute('data-theme', newSettings.theme);
    if (newSettings.theme === 'dark') {
      root.classList.add('dark-theme');
    } else if (newSettings.theme === 'high-contrast') {
      root.classList.add('high-contrast-theme');
    } else {
      root.classList.remove('dark-theme', 'high-contrast-theme');
    }
    
    // Reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // Text spacing
    root.style.setProperty('--text-spacing-multiplier', `${newSettings.textSpacing / 100}`);
    
    // Cursor size
    root.style.setProperty('--cursor-size', `${newSettings.cursorSize}%`);
    
    // Color blind mode
    root.setAttribute('data-colorblind', newSettings.colorBlindMode);
    
    // Screen reader support
    if (newSettings.screenReader) {
      root.setAttribute('data-screen-reader', 'true');
    } else {
      root.removeAttribute('data-screen-reader');
    }
    
    // Keyboard navigation
    if (newSettings.keyboardNavigation) {
      root.setAttribute('data-keyboard-nav', 'true');
    } else {
      root.removeAttribute('data-keyboard-nav');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 100,
      theme: 'light',
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: false,
      colorBlindMode: 'none',
      textSpacing: 100,
      cursorSize: 100
    };
    setSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Accessibility Settings</h2>
                <p className="text-sm text-gray-600">Customize your experience for better accessibility</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="space-y-6">
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Type className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Text Size</h3>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateSetting('fontSize', Math.max(75, settings.fontSize - 25))}
                  icon={ZoomOut}
                >
                  Smaller
                </Button>
                <span className="text-sm font-medium min-w-[4rem] text-center">
                  {settings.fontSize}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateSetting('fontSize', Math.min(200, settings.fontSize + 25))}
                  icon={ZoomIn}
                >
                  Larger
                </Button>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm" style={{ fontSize: `${settings.fontSize}%` }}>
                  Sample text to preview size changes
                </p>
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Theme & Contrast</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={settings.theme === 'light' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('theme', 'light')}
                  icon={Sun}
                  className="justify-start"
                >
                  Light
                </Button>
                <Button
                  variant={settings.theme === 'dark' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('theme', 'dark')}
                  icon={Moon}
                  className="justify-start"
                >
                  Dark
                </Button>
                <Button
                  variant={settings.theme === 'high-contrast' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('theme', 'high-contrast')}
                  icon={Eye}
                  className="justify-start"
                >
                  High Contrast
                </Button>
              </div>
            </div>

            {/* Color Blind Support */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Color Vision Support</h3>
              </div>
              <select
                value={settings.colorBlindMode}
                onChange={(e) => updateSetting('colorBlindMode', e.target.value as any)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
              >
                <option value="none">No color vision adjustment</option>
                <option value="protanopia">Protanopia (Red-blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                <option value="tritanopia">Tritanopia (Blue-blind)</option>
              </select>
            </div>

            {/* Text Spacing */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Type className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Text Spacing</h3>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateSetting('textSpacing', Math.max(75, settings.textSpacing - 25))}
                >
                  Tighter
                </Button>
                <span className="text-sm font-medium min-w-[4rem] text-center">
                  {settings.textSpacing}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateSetting('textSpacing', Math.min(200, settings.textSpacing + 25))}
                >
                  Looser
                </Button>
              </div>
            </div>

            {/* Cursor Size */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MousePointer className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Cursor Size</h3>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateSetting('cursorSize', Math.max(100, settings.cursorSize - 50))}
                >
                  Smaller
                </Button>
                <span className="text-sm font-medium min-w-[4rem] text-center">
                  {settings.cursorSize}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateSetting('cursorSize', Math.min(300, settings.cursorSize + 50))}
                >
                  Larger
                </Button>
              </div>
            </div>

            {/* Motion & Animation */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Motion & Animation</h3>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Reduce motion and animations</span>
              </label>
            </div>

            {/* Assistive Technology */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Assistive Technology</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.screenReader}
                    onChange={(e) => updateSetting('screenReader', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Screen reader optimization</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.keyboardNavigation}
                    onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-2">
                    <Keyboard className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Enhanced keyboard navigation</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={resetSettings}
                icon={RotateCcw}
                className="w-full"
              >
                Reset to Default Settings
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};