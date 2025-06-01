
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, Search, ShoppingCart, Settings, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AvailableNumber {
  phone_number: string;
  region_information: any;
  features: string[];
  cost_information: any;
}

interface OwnedNumber {
  id: string;
  phone_number: string;
  status: string;
  country_code: string;
  purchased_at: string;
  configured_at?: string;
  webhook_url?: string;
  telnyx_status?: string;
}

export const TelnyxPhoneNumbersPage = () => {
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [ownedNumbers, setOwnedNumbers] = useState<OwnedNumber[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [areaCode, setAreaCode] = useState('415'); // San Francisco по умолчанию

  // Загрузка наших номеров
  const loadOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (error) throw error;
      
      if (data.success) {
        setOwnedNumbers(data.phone_numbers);
      }
    } catch (error) {
      console.error('Ошибка загрузки номеров:', error);
      toast.error('Не удалось загрузить номера');
    }
  };

  // Поиск доступных номеров
  const searchNumbers = async () => {
    setSearchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { 
          action: 'search',
          area_code: areaCode,
          country_code: 'US'
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setAvailableNumbers(data.available_numbers);
        toast.success(`Найдено ${data.available_numbers.length} номеров`);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Ошибка поиска номеров');
    } finally {
      setSearchLoading(false);
    }
  };

  // Покупка номера
  const purchaseNumber = async (phoneNumber: string) => {
    setPurchaseLoading(phoneNumber);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { 
          action: 'purchase',
          phone_number: phoneNumber,
          country_code: 'US'
        }
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success('Номер заказан! Настраиваем для AI...');
        
        // Автоматически настраиваем номер
        setTimeout(() => configureNumber(phoneNumber), 2000);
        
        // Обновляем список
        loadOwnedNumbers();
        
        // Убираем из доступных
        setAvailableNumbers(prev => 
          prev.filter(num => num.phone_number !== phoneNumber)
        );
      }
    } catch (error) {
      console.error('Ошибка покупки:', error);
      toast.error('Не удалось купить номер');
    } finally {
      setPurchaseLoading(null);
    }
  };

  // Настройка номера для AI
  const configureNumber = async (phoneNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { 
          action: 'configure',
          phone_number: phoneNumber
        }
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success('Номер настроен для AI звонков!');
        loadOwnedNumbers();
      }
    } catch (error) {
      console.error('Ошибка настройки:', error);
      toast.error('Ошибка настройки номера');
    }
  };

  useEffect(() => {
    loadOwnedNumbers();
  }, []);

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  const getStatusBadge = (number: OwnedNumber) => {
    if (number.configured_at && number.telnyx_status === 'active') {
      return <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle size={12} />
        AI Готов
      </Badge>;
    } else if (number.status === 'pending') {
      return <Badge variant="warning" className="flex items-center gap-1">
        <Clock size={12} />
        Активация
      </Badge>;
    } else {
      return <Badge variant="info">Требует настройки</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Telnyx Номера</h1>
          <p className="text-muted-foreground">
            Простое управление телефонными номерами для AI
          </p>
        </div>
        <Badge variant="fixlyfy" className="px-3 py-1">
          Намного проще Amazon Connect!
        </Badge>
      </div>

      {/* Наши номера */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Ваши AI Номера ({ownedNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ownedNumbers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              У вас пока нет номеров. Купите первый номер ниже! 👇
            </p>
          ) : (
            <div className="grid gap-4">
              {ownedNumbers.map((number) => (
                <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {formatPhoneNumber(number.phone_number)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Куплен: {new Date(number.purchased_at).toLocaleDateString('ru')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(number)}
                    {!number.configured_at && (
                      <Button
                        size="sm"
                        onClick={() => configureNumber(number.phone_number)}
                        className="flex items-center gap-1"
                      >
                        <Settings size={14} />
                        Настроить AI
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Поиск новых номеров */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Купить новый номер
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Код региона (например: 415)"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              className="max-w-xs"
            />
            <Button 
              onClick={searchNumbers} 
              disabled={searchLoading}
              className="flex items-center gap-2"
            >
              <Search size={16} />
              {searchLoading ? 'Поиск...' : 'Найти номера'}
            </Button>
          </div>

          {availableNumbers.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Доступные номера:</h3>
              <div className="grid gap-3">
                {availableNumbers.slice(0, 10).map((number) => (
                  <div key={number.phone_number} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {formatPhoneNumber(number.phone_number)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {number.region_information?.[0]?.region_name || 'USA'} • 
                          ${number.cost_information?.monthly_cost || '1.00'}/мес
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {number.features.includes('voice') && (
                          <Badge variant="success" className="text-xs">Звонки</Badge>
                        )}
                        {number.features.includes('sms') && (
                          <Badge variant="info" className="text-xs">SMS</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => purchaseNumber(number.phone_number)}
                      disabled={purchaseLoading === number.phone_number}
                      className="flex items-center gap-1"
                    >
                      <ShoppingCart size={14} />
                      {purchaseLoading === number.phone_number ? 'Покупаем...' : 'Купить'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
