'use client';

import { useRef, useState } from 'react';
import { Button, Modal, Input, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import AppButton from './Button';

// Тип для выбранного места
interface PickedPlace {
  name: string;
  coords: [number, number]; // [lon, lat]
  orgId?: string;
  address?: string;
}

export type MapPickedPlace = {
  name: string;
  link: string;
};

type MapPickerButtonProps = {
  onPick: (place: MapPickedPlace) => void;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ymaps: any;
  }
}

// Компонент кнопки для выбора места на карте
export function MapPickerButton({ onPick }: MapPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<PickedPlace | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const shareLink = picked ? getYandexShareLink(picked) : '';

  // Генерируем ссылку для шаринга в Яндекс.Картах
  function getYandexShareLink(place: PickedPlace): string {
    if (place.orgId) {
      return `https://yandex.ru/maps/org/${place.orgId}/`;
    }

    const [lat, lon] = place.coords;

    return `https://yandex.ru/maps/?pt=${lon.toFixed(5)},${lat.toFixed(5)}&z=16`;
  }

  // Функция для извлечения метаданных компании из геообъекта Яндекс.Карт
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getCompanyMetaData(geoObject: any) {
    const metaData = geoObject?.properties.get('metaDataProperty');

    return (
      geoObject?.properties.get('CompanyMetaData') ??
      metaData?.CompanyMetaData ??
      metaData?.get?.('CompanyMetaData') ??
      null
    );
  }

  // Функция для обработки выбора геообъекта на карте
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function pickGeoObject(geoObject: any, coords: [number, number]) {
    const companyMeta = getCompanyMetaData(geoObject);
    const address =
      geoObject?.getAddressLine?.() ??
      geoObject?.properties.get('description') ??
      geoObject?.properties.get('text') ??
      '';
    const name = companyMeta?.name ?? geoObject?.properties.get('name') ?? address;

    if (!name) {
      return;
    }

    setPicked({
      name,
      coords,
      orgId: companyMeta?.id ?? undefined,
      address,
    });
  }

  // Функция для получения информации о месте по координатам
  function pickByCoords(coords: [number, number]) {
    window.ymaps
      .geocode(coords, { kind: 'house', results: 1 })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        pickGeoObject(res.geoObjects.get(0), coords);
      });
  }

  const initMap = () => {
    window.ymaps.ready(() => {
      // Если карта уже была — уничтожаем
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }

      const map = new window.ymaps.Map(
        'ymap-container',
        {
          center: [55.7558, 37.6173],
          zoom: 12,
          controls: ['searchControl', 'geolocationControl', 'zoomControl'],
        },
        {
          searchControlProvider: 'yandex#search',
          yandexMapDisablePoiInteractivity: true,
        },
      );

      mapRef.current = map;

      const searchControl = map.controls.get('searchControl');
      searchControl.options.set({ provider: 'yandex#search' });

      map.events.add('click', (event: unknown) => {
        const coords = (event as { get: (key: string) => [number, number] }).get('coords');
        pickByCoords(coords);
      });

      searchControl.events.add('resultselect', (event: unknown) => {
        const index = (event as { get: (key: string) => number }).get('index');
        const result = searchControl.getResultsArray()[index];

        if (!result) {
          return;
        }

        pickGeoObject(result, result.geometry.getCoordinates() as [number, number]);
      });
    });
  };
  // Функция для загрузки API Яндекс.Карт и инициализации карты
  const loadMap = () => {
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.onload = initMap;
      document.head.appendChild(script);
      return;
    }

    initMap();
  };

  // Функция для открытия модального окна с картой
  const handleOpen = () => {
    setOpen(true);
    setPicked(null);
    setTimeout(loadMap, 0);
  };

  const handleCancel = () => {
    if (mapRef.current) {
      mapRef.current.destroy();
      mapRef.current = null;
    }

    setOpen(false);
  };

  // Подтверждаем выбор места и передаем данные родителю
  const handleOk = () => {
    if (!picked) {
      return;
    }

    onPick({
      name: picked.name,
      link: shareLink,
    });
    handleCancel();
  };

  return (
    <>
      <AppButton title='Выбрать на карте' color='lilac' onClick={handleOpen} />

      <Modal
        title='Выберите место'
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        width={800}
        okButtonProps={{ disabled: !picked }}
        okText='Готово'
        cancelText='Отмена'
      >
        <div id='ymap-container' style={{ width: '100%', height: 420, borderRadius: 8 }} />

        {picked && (
          <Space orientation='vertical' style={{ marginTop: 16, width: '100%' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input value={picked.orgId ? `${picked.name}: ${shareLink}` : shareLink} readOnly />
              <Button
                icon={<CopyOutlined />}
                onClick={() =>
                  navigator.clipboard.writeText(
                    picked.orgId ? `${picked.name}: ${shareLink}` : shareLink,
                  )
                }
              >
                Копировать
              </Button>
            </Space.Compact>
          </Space>
        )}
      </Modal>
    </>
  );
}
