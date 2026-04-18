import { useRef, useState } from "react";
import { Button, Modal, Input, Space } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import AppButton from "./Button";

// Тип для выбранного места
interface PickedPlace {
  name: string;
  coords: [number, number]; // [lon, lat]
  orgId?: string;
  address?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ymaps: any;
  }
}

// Компонент кнопки для выбора места на карте
export function MapPickerButton() {
  const [open, setOpen]     = useState(false);
  const [picked, setPicked] = useState<PickedPlace | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef    = useRef<any>(null);
  const shareLink = picked ? getYandexShareLink(picked) : "";

  // Генерируем ссылку для шаринга в Яндекс.Картах
  function getYandexShareLink(place: PickedPlace): string {
    if (place.orgId) {
      return `https://yandex.ru/maps/org/${place.orgId}/`;
    }
    
    const [lon, lat] = place.coords;
    const lonR       = lon.toFixed(5);
    const latR       = lat.toFixed(5);

    return `https://yandex.ru/maps/?pt=${lonR},${latR}&z=16`;
  }

  // Инициализация карты и установка обработчиков
  const initMap = () => {
    window.ymaps.ready(() => {
      // Если карта уже была — уничтожаем
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }

      const map = new window.ymaps.Map("ymap-container", {
        center: [55.7558, 37.6173],
        zoom: 12,
        controls: ["searchControl", "geolocationControl", "zoomControl"],
      });

      mapRef.current = map;

      const searchControl = map.controls.get("searchControl");
      searchControl.options.set({ provider: "yandex#search" });

      // Обработчик кликов по карте
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.events.add("click", (e: any) => {
        const coords = e.get("coords") as [number, number];
        const [lat, lon] = coords;

        window.ymaps
          .geocode(coords, { kind: "house", results: 1 })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((res: any) => {
            const firstGeo = res.geoObjects.get(0);
            const address = firstGeo?.getAddressLine() ?? "";
            const meta = firstGeo?.properties.get("CompanyMetaData");
            const orgId = meta?.id ?? undefined;
            const name = meta?.name ?? address;

            setPicked({ name, coords: [lon, lat], orgId, address });
          });
      });

      // Обработчик выбора результата в поиске
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      searchControl.events.add("resultselect", (e: any) => {
        const index = e.get("index");
        const results = searchControl.getResultsArray();
        const result = results[index];

        if (!result) return;

        const coords = result.geometry.getCoordinates() as [number, number];
        const [lat, lon] = coords;
        const orgId = result.properties.get("id") ?? undefined;
        const name =
          result.properties.get("name") ?? result.properties.get("text") ?? "";
        const address = result.properties.get("description") ?? "";

        setPicked({
          name,
          coords: [lon, lat],
          orgId,
          address,
        });
      });
    });
  };

  // Открываем модалку и инициализируем карту
  const handleOpen = () => {
    setOpen(true);
    // Подгружаем скрипт Яндекс Карт если ещё не загружен
    if (!window.ymaps) {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  };

  // Закрываем модалку и уничтожаем карту
  const handleCancel = () => {
    if (mapRef.current) {
      mapRef.current.destroy();
      mapRef.current = null;
    }
    setOpen(false);
  };

  return (
    <>
      <AppButton
        title="Выбрать на карте"
        color={"lilac"}
        onClick={handleOpen}
      />

      <Modal
        title="Выберите место"
        open={open}
        onCancel={handleCancel}
        onOk={() => setOpen(false)}
        width={800}
        okText="Готово"
        cancelText="Отмена"
      >
        <div
          id="ymap-container"
          style={{ width: "100%", height: 420, borderRadius: 8 }}
        />

        {picked && (
          <Space
            orientation="vertical"
            style={{ marginTop: 16, width: "100%" }}
          >
            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={
                  picked.orgId ? `${picked.name}: ${shareLink}` : shareLink
                }
                readOnly
              />
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
