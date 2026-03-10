import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import {
  DataGridPremium,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid-premium';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthRow {
  id: number;
  supplier: string;
  supplierId: number;
  location: string;
  locationId: number;
  productCode: string;
  productName: string;
  type: 'Weekly' | 'Monthly' | 'Daily' | 'Unlimited' | 'Self';
  authVol: number | null;
  remainingVol: number | null;
  renewalVol: number | null;
  endDate: string;
  active: boolean;
  status: 'active' | 'expiring' | 'expired';
  sequence: number;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const PRODUCTS: Record<string, string> = {
  A: '91 OCTANE w/o 10% ETH',
  A78: '91 OCT w/o 10% ETH low RVP',
  AR: 'PREM RBOB 93 OCT w/ 10% ETH',
  A5: '88.5 OCT w/o 10% ETH',
  AMS: '88.5 OCT w/o 10% ETH low RVP',
  V: '87 OCTANE w/ 10% ETH',
  V78: '87 OCT w/ 10% ETH low RVP',
  V2: '87 OCTANE w/ 10% ETH',
  V3: '86 OCTANE w/ 10% ETH',
  V3S: '86 OCT w/ 10% ETH low RVP',
  NEP: '87 OCT w/o ETH export only',
  NR: 'RBOB 87 OCT w/ 10% ETH',
  E: 'ETHANOL',
  L: 'PROPANE',
  T: 'TRANSMIX',
  Q: 'COMMERCIAL JET FUEL',
  QSF: 'JET A w/ SYNTH HYDROCARBONS',
  X: '#2 ULSD 15PPM MAX SULFUR',
  XHO: '#2 ULSD 15PPM NTDF',
  Y: '#1 ULSD 15PPM MAX SULFUR',
  YM: '#1 ULSD ROCKY MTN',
  D: '#2 ULSD PREMIUM DIESEL',
  ZB: '99%/100% METHYL ESTER (BIO)',
  B99: '99% METHYL ESTER (BIO)',
  JP5: 'MILITARY JET FUEL',
};

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

interface RawAuth {
  supplier: string;
  supplierId: number;
  location: string;
  locationId: number;
  productCode: string;
  type: AuthRow['type'];
  authVol: number | null;
  remainingVol: number | null;
  renewalVol: number | null;
  endDate: string;
  active: boolean;
}

const RAW_DATA: RawAuth[] = [
  // 201 DES MOINES
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'DES MOINES', locationId: 201, productCode: 'A',   type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 100000, endDate: '05/31/2026', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'DES MOINES', locationId: 201, productCode: 'E',   type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 67000,  endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'DES MOINES', locationId: 201, productCode: 'V',   type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 24000,  endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'DES MOINES', locationId: 201, productCode: 'X',   type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 57000,  endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'DES MOINES', locationId: 201, productCode: 'A78', type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 72000,  endDate: '12/31/2999', active: true },
  { supplier: 'Thornfield Petroleum',  supplierId: 230, location: 'DES MOINES', locationId: 201, productCode: 'A',   type: 'Monthly',   authVol: 20000,  remainingVol: 19000, renewalVol: 20000,  endDate: '12/31/2999', active: true },
  { supplier: 'Thornfield Petroleum',  supplierId: 230, location: 'DES MOINES', locationId: 201, productCode: 'V',   type: 'Weekly',    authVol: 25000,  remainingVol: 20000, renewalVol: 25000,  endDate: '01/19/2026', active: true },
  { supplier: 'Thornfield Petroleum',  supplierId: 230, location: 'DES MOINES', locationId: 201, productCode: 'E',   type: 'Unlimited', authVol: null,   remainingVol: null,  renewalVol: null,   endDate: '12/31/2999', active: true },
  { supplier: 'Foxridge Supply Group', supplierId: 263, location: 'DES MOINES', locationId: 201, productCode: 'A',   type: 'Unlimited', authVol: null,   remainingVol: null,  renewalVol: null,   endDate: '12/31/2999', active: true },
  { supplier: 'Foxridge Supply Group', supplierId: 263, location: 'DES MOINES', locationId: 201, productCode: 'X',   type: 'Daily',     authVol: 7000,   remainingVol: 3000,  renewalVol: 7000,   endDate: '12/31/2999', active: true },
  { supplier: 'Baxter Energy Group',   supplierId: 136, location: 'DES MOINES', locationId: 201, productCode: 'E',   type: 'Weekly',    authVol: 24000,  remainingVol: 15000, renewalVol: 24000,  endDate: '12/31/2999', active: true },
  { supplier: 'Baxter Energy Group',   supplierId: 136, location: 'DES MOINES', locationId: 201, productCode: 'A',   type: 'Monthly',   authVol: 98000,  remainingVol: 0,     renewalVol: 98000,  endDate: '12/31/2999', active: true },

  // 207 MASON CITY
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'MASON CITY', locationId: 207, productCode: 'A',  type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 38000,  endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'MASON CITY', locationId: 207, productCode: 'E',  type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 85000,  endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'MASON CITY', locationId: 207, productCode: 'V',  type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 26000,  endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'MASON CITY', locationId: 207, productCode: 'AR', type: 'Self',      authVol: null,   remainingVol: null,  renewalVol: 69000,  endDate: '04/18/2025', active: true },
  { supplier: 'Questmark Energy',      supplierId: 160, location: 'MASON CITY', locationId: 207, productCode: 'A',  type: 'Monthly',   authVol: 100000, remainingVol: 5000,  renewalVol: 100000, endDate: '12/31/2999', active: true },
  { supplier: 'Questmark Energy',      supplierId: 160, location: 'MASON CITY', locationId: 207, productCode: 'E',  type: 'Unlimited', authVol: null,   remainingVol: null,  renewalVol: null,   endDate: '12/31/2999', active: true },
  { supplier: 'Copperhead Energy',     supplierId: 179, location: 'MASON CITY', locationId: 207, productCode: 'V',  type: 'Weekly',    authVol: 20000,  remainingVol: 2000,  renewalVol: 20000,  endDate: '07/13/2027', active: true },
  { supplier: 'Copperhead Energy',     supplierId: 179, location: 'MASON CITY', locationId: 207, productCode: 'X',  type: 'Daily',     authVol: 4000,   remainingVol: 2000,  renewalVol: 4000,   endDate: '12/31/2999', active: true },
  { supplier: 'Ardent Fuel Solutions', supplierId: 86,  location: 'MASON CITY', locationId: 207, productCode: 'A',  type: 'Monthly',   authVol: 27000,  remainingVol: 15000, renewalVol: 27000,  endDate: '10/28/2025', active: true },

  // 347 BETTENDORF
  { supplier: 'Lancer Energy Corp',  supplierId: 201, location: 'BETTENDORF', locationId: 347, productCode: 'A', type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 94000, endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',  supplierId: 201, location: 'BETTENDORF', locationId: 347, productCode: 'V', type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 45000, endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',  supplierId: 201, location: 'BETTENDORF', locationId: 347, productCode: 'E', type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 83000, endDate: '12/31/2999', active: true },
  { supplier: 'Yarrow Energy Group', supplierId: 242, location: 'BETTENDORF', locationId: 347, productCode: 'A', type: 'Weekly',    authVol: 15000, remainingVol: 1000,  renewalVol: 15000, endDate: '12/31/2999', active: true },
  { supplier: 'Yarrow Energy Group', supplierId: 242, location: 'BETTENDORF', locationId: 347, productCode: 'V', type: 'Monthly',   authVol: 87000, remainingVol: 35000, renewalVol: 87000, endDate: '12/31/2999', active: true },
  { supplier: 'Yarrow Energy Group', supplierId: 242, location: 'BETTENDORF', locationId: 347, productCode: 'E', type: 'Daily',     authVol: 10000, remainingVol: 5000,  renewalVol: 10000, endDate: '12/31/2999', active: true },
  { supplier: 'Hillcrest Petroleum', supplierId: 144, location: 'BETTENDORF', locationId: 347, productCode: 'A', type: 'Unlimited', authVol: null,  remainingVol: null,  renewalVol: null,  endDate: '12/31/2999', active: true },
  { supplier: 'Hillcrest Petroleum', supplierId: 144, location: 'BETTENDORF', locationId: 347, productCode: 'V', type: 'Monthly',   authVol: 29000, remainingVol: 5000,  renewalVol: 29000, endDate: '12/31/2999', active: true },
  { supplier: 'Hillcrest Petroleum', supplierId: 144, location: 'BETTENDORF', locationId: 347, productCode: 'X', type: 'Daily',     authVol: 3000,  remainingVol: 1000,  renewalVol: 3000,  endDate: '09/06/2026', active: true },

  // 227 CARTHAGE
  { supplier: 'Lancer Energy Corp',     supplierId: 201, location: 'CARTHAGE', locationId: 227, productCode: 'A', type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 35000, endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',     supplierId: 201, location: 'CARTHAGE', locationId: 227, productCode: 'V', type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 50000, endDate: '12/02/2025', active: true },
  { supplier: 'Wellspring Petroleum',   supplierId: 294, location: 'CARTHAGE', locationId: 227, productCode: 'A', type: 'Monthly',   authVol: 96000, remainingVol: 38000, renewalVol: 96000, endDate: '12/31/2999', active: true },
  { supplier: 'Wellspring Petroleum',   supplierId: 294, location: 'CARTHAGE', locationId: 227, productCode: 'E', type: 'Daily',     authVol: 9000,  remainingVol: 7000,  renewalVol: 9000,  endDate: '05/23/2027', active: true },
  { supplier: 'Wellspring Petroleum',   supplierId: 294, location: 'CARTHAGE', locationId: 227, productCode: 'V', type: 'Unlimited', authVol: null,  remainingVol: null,  renewalVol: null,  endDate: '12/31/2999', active: true },
  { supplier: 'Dalton Supply Partners', supplierId: 140, location: 'CARTHAGE', locationId: 227, productCode: 'A', type: 'Weekly',    authVol: 14000, remainingVol: 6000,  renewalVol: 14000, endDate: '12/31/2999', active: true },
  { supplier: 'Dalton Supply Partners', supplierId: 140, location: 'CARTHAGE', locationId: 227, productCode: 'V', type: 'Daily',     authVol: 4000,  remainingVol: 0,     renewalVol: 4000,  endDate: '12/31/2999', active: true },
  { supplier: 'Dalton Supply Partners', supplierId: 140, location: 'CARTHAGE', locationId: 227, productCode: 'X', type: 'Unlimited', authVol: null,  remainingVol: null,  renewalVol: null,  endDate: '10/05/2026', active: true },

  // 245 GREAT BEND
  { supplier: 'Lancer Energy Corp',  supplierId: 201, location: 'GREAT BEND', locationId: 245, productCode: 'A',   type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 67000, endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',  supplierId: 201, location: 'GREAT BEND', locationId: 245, productCode: 'E',   type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 20000, endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',  supplierId: 201, location: 'GREAT BEND', locationId: 245, productCode: 'V',   type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 42000, endDate: '11/08/2026', active: true },
  { supplier: 'Lancer Energy Corp',  supplierId: 201, location: 'GREAT BEND', locationId: 245, productCode: 'A5',  type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 99000, endDate: '12/03/2026', active: true },
  { supplier: 'Lancer Energy Corp',  supplierId: 201, location: 'GREAT BEND', locationId: 245, productCode: 'B99', type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 75000, endDate: '12/31/2999', active: true },
  { supplier: 'Upland Crude Supply', supplierId: 290, location: 'GREAT BEND', locationId: 245, productCode: 'A',   type: 'Monthly',   authVol: 97000, remainingVol: 80000, renewalVol: 97000, endDate: '12/31/2999', active: true },
  { supplier: 'Upland Crude Supply', supplierId: 290, location: 'GREAT BEND', locationId: 245, productCode: 'V',   type: 'Weekly',    authVol: 20000, remainingVol: 13000, renewalVol: 20000, endDate: '12/31/2999', active: true },
  { supplier: 'Upland Crude Supply', supplierId: 290, location: 'GREAT BEND', locationId: 245, productCode: 'E',   type: 'Unlimited', authVol: null,  remainingVol: null,  renewalVol: null,  endDate: '03/02/2025', active: false },
  { supplier: 'Upland Crude Supply', supplierId: 290, location: 'GREAT BEND', locationId: 245, productCode: 'X',   type: 'Daily',     authVol: 4000,  remainingVol: 3000,  renewalVol: 4000,  endDate: '02/07/2027', active: true },

  // 336 LINCOLN
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'LINCOLN', locationId: 336, productCode: 'A',   type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 39000, endDate: '08/30/2027', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'LINCOLN', locationId: 336, productCode: 'V',   type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 75000, endDate: '12/31/2999', active: true },
  { supplier: 'Lancer Energy Corp',    supplierId: 201, location: 'LINCOLN', locationId: 336, productCode: 'V78', type: 'Self',      authVol: null,  remainingVol: null,  renewalVol: 22000, endDate: '12/24/2026', active: true },
  { supplier: 'Forrest Fuel Services', supplierId: 142, location: 'LINCOLN', locationId: 336, productCode: 'A',   type: 'Weekly',    authVol: 17000, remainingVol: 10000, renewalVol: 17000, endDate: '12/31/2999', active: true },
  { supplier: 'Forrest Fuel Services', supplierId: 142, location: 'LINCOLN', locationId: 336, productCode: 'V',   type: 'Unlimited', authVol: null,  remainingVol: null,  renewalVol: null,  endDate: '12/31/2999', active: true },
  { supplier: 'Forrest Fuel Services', supplierId: 142, location: 'LINCOLN', locationId: 336, productCode: 'E',   type: 'Monthly',   authVol: 25000, remainingVol: 0,     renewalVol: 25000, endDate: '12/31/2999', active: true },
  { supplier: 'Forrest Fuel Services', supplierId: 142, location: 'LINCOLN', locationId: 336, productCode: 'X',   type: 'Weekly',    authVol: 13000, remainingVol: 12000, renewalVol: 13000, endDate: '12/31/2999', active: true },
];

// ---------------------------------------------------------------------------
// Derive status + sequence numbers
// ---------------------------------------------------------------------------

function deriveStatus(endDate: string, active: boolean): AuthRow['status'] {
  if (!active) return 'expired';
  if (endDate === '12/31/2999') return 'active';
  const end = new Date(endDate);
  const now = new Date('2026-03-06');
  if (end < now) return 'expired';
  if (end.getTime() - now.getTime() < 90 * 24 * 60 * 60 * 1000) return 'expiring';
  return 'active';
}

function buildRows(data: RawAuth[]): AuthRow[] {
  const counters = new Map<string, number>();
  return data.map((r, i) => {
    const key = `${r.locationId}|${r.productCode}`;
    const seq = (counters.get(key) ?? 0) + 1;
    counters.set(key, seq);
    return {
      ...r,
      id: i + 1,
      productName: PRODUCTS[r.productCode] ?? r.productCode,
      status: deriveStatus(r.endDate, r.active),
      sequence: seq,
    };
  });
}

const ALL_ROWS = buildRows(RAW_DATA);

// ---------------------------------------------------------------------------
// Cell renderers
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Unlimited: { bg: '#e8f5e9', text: '#2e7d32' },
  Monthly:   { bg: '#e3f2fd', text: '#1565c0' },
  Weekly:    { bg: '#fff3e0', text: '#e65100' },
  Daily:     { bg: '#fce4ec', text: '#c62828' },
  Self:      { bg: '#f3e5f5', text: '#7b1fa2' },
};

function TypeChip({ value }: { value: string }) {
  const color = TYPE_COLORS[value] ?? { bg: '#f5f5f5', text: '#616161' };
  return (
    <Chip
      label={value}
      size="small"
      sx={{ bgcolor: color.bg, color: color.text, fontWeight: 600, fontSize: '0.75rem', height: 24 }}
    />
  );
}

function VolumeBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const color = pct <= 10 ? 'error' : pct <= 25 ? 'warning' : 'primary';
  return (
    <Tooltip title={`${remaining.toLocaleString()} / ${total.toLocaleString()} gal (${Math.round(pct)}%)`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          color={color}
          sx={{ flex: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'right', color: 'text.secondary' }}>
          {Math.round(pct)}%
        </Typography>
      </Box>
    </Tooltip>
  );
}

function DateBadge({ endDate, status }: { endDate: string; status: AuthRow['status'] }) {
  const config = {
    active:   { bg: '#e8f5e9', color: '#2e7d32' },
    expiring: { bg: '#fff3e0', color: '#e65100' },
    expired:  { bg: '#fce4ec', color: '#c62828' },
  };
  const { bg, color } = config[status];
  return (
    <Chip
      label={endDate}
      size="small"
      sx={{ bgcolor: bg, color, fontWeight: 500, fontSize: '0.75rem', height: 24, borderRadius: '6px' }}
    />
  );
}

function StatusDot({ status }: { status: AuthRow['status'] }) {
  const config = {
    active:   { color: '#4caf50', label: 'Active' },
    expiring: { color: '#ff9800', label: 'Expiring' },
    expired:  { color: '#f44336', label: 'Expired' },
  };
  const { color, label } = config[status];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Shared column definitions
// ---------------------------------------------------------------------------

const sharedColumns: GridColDef<AuthRow>[] = [
  {
    field: 'sequence',
    headerName: 'Sequence #',
    width: 130,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<AuthRow>) =>
      params.value != null ? (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
        >
          {params.value}
        </Typography>
      ) : null,
  },
  {
    field: 'supplier',
    headerName: 'Supplier',
    width: 220,
    renderCell: (params: GridRenderCellParams<AuthRow>) =>
      params.value ? (
        <Typography variant="body2" noWrap sx={params.row.sequence === 1 ? { fontWeight: 700 } : undefined}>
          <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>{params.row.supplierId}</Box>
          {params.value}
        </Typography>
      ) : null,
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 110,
    renderCell: (params: GridRenderCellParams<AuthRow>) =>
      params.value ? <TypeChip value={params.value} /> : null,
  },
  {
    field: 'authVol',
    headerName: 'Auth Vol',
    width: 110,
    type: 'number',
    valueFormatter: (value: number | null) => value != null ? value.toLocaleString() : '—',
  },
  {
    field: 'remainingVol',
    headerName: 'Remaining',
    width: 170,
    renderCell: (params: GridRenderCellParams<AuthRow>) => {
      if (params.row.remainingVol == null || params.row.authVol == null) return '—';
      return <VolumeBar remaining={params.row.remainingVol} total={params.row.authVol} />;
    },
  },
  {
    field: 'renewalVol',
    headerName: 'Renewal Vol',
    width: 120,
    type: 'number',
    valueFormatter: (value: number | null) => value != null ? value.toLocaleString() : '—',
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    width: 130,
    renderCell: (params: GridRenderCellParams<AuthRow>) =>
      params.value ? <DateBadge endDate={params.value} status={params.row.status} /> : null,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    renderCell: (params: GridRenderCellParams<AuthRow>) =>
      params.value ? <StatusDot status={params.value as AuthRow['status']} /> : null,
  },
];

const gridSx = {
  '& .row-expired':  { bgcolor: 'rgba(244, 67, 54, 0.04)' },
  '& .row-expiring': { bgcolor: 'rgba(255, 152, 0, 0.04)' },
  '& .MuiDataGrid-groupingCriteriaCell': { fontWeight: 600 },
  '& .MuiDataGrid-cell': { display: 'flex !important', alignItems: 'center !important' },
};

const getRowClassName = (params: { row: AuthRow }) => {
  if (params.row.status === 'expired') return 'row-expired';
  if (params.row.status === 'expiring') return 'row-expiring';
  return '';
};

// ---------------------------------------------------------------------------
// Custom footer
// ---------------------------------------------------------------------------

function GroupCountFooter({ label, count }: { label: string; count: number }) {
  return (
    <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
      <Typography variant="caption" color="text.secondary">
        Total {label}: {count}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Grid views
// ---------------------------------------------------------------------------

function ByLocationView({ rows }: { rows: AuthRow[] }) {
  const apiRef = useGridApiRef();
  const locationCount = useMemo(() => new Set(rows.map((r) => r.locationId)).size, [rows]);

  const columns: GridColDef<AuthRow>[] = [
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      valueGetter: (_value: string, row: AuthRow) => `${row.locationId} ${row.location}`,
    },
    {
      field: 'productCode',
      headerName: 'Product',
      width: 160,
    },
    ...sharedColumns,
  ];

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      rowGrouping: { model: ['location', 'productCode'] },
    },
  });

  return (
    <DataGridPremium
      apiRef={apiRef}
      rows={rows}
      columns={columns}
      initialState={initialState}
      defaultGroupingExpansionDepth={-1}
      groupingColDef={{ headerName: 'Location / Product', width: 300, hideDescendantCount: false }}
      getRowClassName={getRowClassName}
      density="compact"
      getRowHeight={() => 48}
      disableRowSelectionOnClick
      slots={{ footer: () => <GroupCountFooter label="Locations" count={locationCount} /> }}
      sx={gridSx}
    />
  );
}

function ByProductView({ rows }: { rows: AuthRow[] }) {
  const apiRef = useGridApiRef();
  const productCount = useMemo(() => new Set(rows.map((r) => r.productCode)).size, [rows]);

  const columns: GridColDef<AuthRow>[] = [
    {
      field: 'productCode',
      headerName: 'Product',
      width: 200,
      valueGetter: (_value: string, row: AuthRow) => `${row.productCode} ${row.productName}`,
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 180,
      valueGetter: (_value: string, row: AuthRow) => `${row.locationId} ${row.location}`,
    },
    ...sharedColumns,
  ];

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: {
      rowGrouping: { model: ['productCode', 'location'] },
    },
  });

  return (
    <DataGridPremium
      apiRef={apiRef}
      rows={rows}
      columns={columns}
      initialState={initialState}
      defaultGroupingExpansionDepth={-1}
      groupingColDef={{ headerName: 'Product / Location', width: 320, hideDescendantCount: false }}
      getRowClassName={getRowClassName}
      density="compact"
      getRowHeight={() => 48}
      disableRowSelectionOnClick
      slots={{ footer: () => <GroupCountFooter label="Products" count={productCount} /> }}
      sx={gridSx}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type ViewMode = 'byLocation' | 'byProduct';
type StatusFilter = 'all' | 'active' | 'expiring' | 'expired';

export default function AuthSequencingTablePlus() {
  const [view, setView] = useState<ViewMode>('byLocation');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_ROWS.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.supplier.toLowerCase().includes(q) ||
        row.location.toLowerCase().includes(q) ||
        row.productCode.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter]);

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
          Auth Sequencing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View authorization sequences by location and product.
        </Typography>
      </Box>

      {/* Controls row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search supplier, location, or product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="expiring">Expiring</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>View by:</Typography>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_e, val) => val && setView(val)}
            size="small"
          >
            <ToggleButton value="byLocation">Location</ToggleButton>
            <ToggleButton value="byProduct">Product</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Grid */}
      <Box sx={{ height: 700, width: '100%' }}>
        {view === 'byLocation'
          ? <ByLocationView rows={filteredRows} />
          : <ByProductView rows={filteredRows} />
        }
      </Box>
    </Box>
  );
}
