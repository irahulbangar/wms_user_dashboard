export interface ScreenshotItem {
  id: number;
  name: string;
  screenshot: string | null;
}

export async function captureScreenshots<
  T extends { id: number; name: string },
>(
  items: T[],
  selectedIds: number[],
  captureFn: (id: number) => Promise<string | null>,
): Promise<ScreenshotItem[]> {
  const itemsMap = new Map(items.map((item) => [item.id, item]));
  const screenshots: ScreenshotItem[] = [];
  for (let index = 0; index < selectedIds.length; index++) {
    const id = selectedIds[index];
    const item = itemsMap.get(id);

    try {
      if (index > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const screenshot = await captureFn(id);
      screenshots.push({
        id,
        name: item?.name || `Item ${id}`,
        screenshot,
      });
    } catch (error) {
      console.error(`Failed to capture screenshot for item ${id}:`, error);
      screenshots.push({
        id,
        name: item?.name || `Item ${id}`,
        screenshot: null,
      });
    }
  }

  return screenshots;
}
