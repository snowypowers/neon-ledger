export interface Device {
  vendorId: number;
  productId: number;
  path?: string;
  serialNumber?: string;
  manufacturer?: string;
  product?: string;
  release: number;
  interface: number;
  usagePage?: number;
  usage?: number;
}

export class HID {
  constructor(path: string);
  constructor(vid: number, pid: number);
  close(): void;
  pause(): void;
  read(callback: (err: any, data: number[]) => void): void;
  readSync(): number[];
  readTimeout(time_out: number): number[];
  sendFeatureReport(data: number[]): number;
  getFeatureReport(report_id: number, report_length: number): number[];
  getDeviceInfo(): string;
  resume(): void;
  on(event: string, handler: (value: any) => void): void;
  write(values: number[]): number;
  setDriverType(type: string): void;
}
export function devices(): Device[];
