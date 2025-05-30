
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Shield, Key, Eye, AlertTriangle, Clock } from "lucide-react";

export const TeamSecurityTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Team Security Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure security policies and access controls for your team.
        </p>
      </div>

      {/* Password & Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password & Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enforce Strong Passwords</Label>
              <p className="text-sm text-muted-foreground">
                Require passwords with minimum 8 characters, numbers, and symbols
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all team members
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Expiration</Label>
              <p className="text-sm text-muted-foreground">
                Force password changes every specified period
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="90">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-logout Inactive Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out users after period of inactivity
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="30">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Limit Concurrent Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Restrict number of active sessions per user
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input type="number" value="3" className="w-16" />
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Address Restrictions</Label>
              <p className="text-sm text-muted-foreground">
                Restrict access to specific IP addresses or ranges
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Device Registration</Label>
              <p className="text-sm text-muted-foreground">
                Require device registration for mobile access
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Location-based Access</Label>
              <p className="text-sm text-muted-foreground">
                Restrict access based on geographic location
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Audit & Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Audit & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Activity Logging</Label>
              <p className="text-sm text-muted-foreground">
                Track and log all login attempts and activities
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Failed Login Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Alert administrators about suspicious login attempts
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Access Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Monitor and log access to sensitive data
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" className="text-red-600 border-red-200">
              <Lock className="h-4 w-4 mr-2" />
              Lock All Sessions
            </Button>
            <Button variant="outline" className="text-red-600 border-red-200">
              <Key className="h-4 w-4 mr-2" />
              Force Password Reset
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use these actions only in case of suspected security breach.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
