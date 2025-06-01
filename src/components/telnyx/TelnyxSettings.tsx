
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Phone, Settings, Zap, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TelnyxConfig {
  voice_enabled: boolean;
  sms_enabled: boolean;
  ai_assistant_enabled: boolean;
  greeting_message: string;
  business_hours: any;
  emergency_detection: boolean;
}

export const TelnyxSettings = () => {
  const [config, setConfig] = useState<TelnyxConfig>({
    voice_enabled: true,
    sms_enabled: true,
    ai_assistant_enabled: true,
    greeting_message: 'Привет! Меня зовут AI ассистент. Как дела?',
    business_hours: {},
    emergency_detection: true
  });
  const [saving, setSaving] = useState(false);

  const saveConfig = async () => {
    setSaving(true);
    try {
      // Здесь будет сохранение в базу
      await new Promise(resolve => setTimeout(resolve, 1000)); // Симуляция
      toast.success('Настройки Telnyx сохранены!');
    } catch (error) {
      toast.error('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Настройки Telnyx</h2>
          <p className="text-muted-foreground">
            Простая настройка AI помощника для звонков и SMS
          </p>
        </div>
        <Badge variant="fixlyfy" className="flex items-center gap-1">
          <CheckCircle size={14} />
          Telnyx Подключен
        </Badge>
      </div>

      {/* Основные настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Основные функции
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Phone size={16} />
                Голосовые звонки
              </Label>
              <p className="text-sm text-muted-foreground">
                AI отвечает на входящие звонки
              </p>
            </div>
            <Switch
              checked={config.voice_enabled}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, voice_enabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <MessageSquare size={16} />
                SMS сообщения
              </Label>
              <p className="text-sm text-muted-foreground">
                Прием и отправка SMS через AI
              </p>
            </div>
            <Switch
              checked={config.sms_enabled}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, sms_enabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Zap size={16} />
                Детекция экстренных случаев
              </Label>
              <p className="text-sm text-muted-foreground">
                AI определяет срочные заявки автоматически
              </p>
            </div>
            <Switch
              checked={config.emergency_detection}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, emergency_detection: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Настройка приветствия */}
      <Card>
        <CardHeader>
          <CardTitle>Приветствие AI помощника</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="greeting">Текст приветствия</Label>
            <Input
              id="greeting"
              value={config.greeting_message}
              onChange={(e) => 
                setConfig(prev => ({ ...prev, greeting_message: e.target.value }))
              }
              placeholder="Введите приветствие для клиентов"
            />
            <p className="text-xs text-muted-foreground">
              Доступные переменные: {'{agent_name}'}, {'{company_name}'}, {'{time_of_day}'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Преимущества Telnyx */}
      <Card>
        <CardHeader>
          <CardTitle>Почему Telnyx лучше Amazon Connect?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Telnyx (простота)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Один API ключ</li>
                <li>• Простые WebHook'и</li>
                <li>• Покупка номеров через API</li>
                <li>• Встроенная поддержка SMS</li>
                <li>• Качественное аудио</li>
                <li>• Никаких Instance ID</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">❌ Amazon Connect (сложность)</h4>
              <ul className="space-y-1 text-sm">
              <li>• Множество настроек IAM</li>
                <li>• Сложные Contact Flow</li>
                <li>• Lambda функции</li>
                <li>• Media Streaming настройка</li>
                <li>• Instance управление</li>
                <li>• ARN и ID везде</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? 'Сохраняем...' : 'Сохранить настройки'}
        </Button>
      </div>
    </div>
  );
};
