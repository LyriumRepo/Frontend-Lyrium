import React from 'react';
import {
  Activity, AlertCircle, AlertOctagon, AlertTriangle, ArrowDown,
  ArrowLeft, ArrowRight, BadgeCheck, Ban, Banknote, BarChart, Bell,
  Bold, BookOpen, Bot, Briefcase, Building, Building2, Clapperboard, Calendar,
  CalendarCheck, CalendarClock, CalendarDays, CalendarSearch, CalendarX,
  Camera, Check, CheckCheck,
  CheckCircle, CheckCircle2, CheckSquare, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, Clock, CloudUpload, Coins, Columns, Contact, CreditCard, Crown, DollarSign,
  Download, Edit, ExternalLink, Eye, EyeOff, Facebook, FileSpreadsheet,
  FileText, FileX, Filter, FolderOpen, FolderTree, Gift, Globe,
  Headphones, Headset, Heart, HelpCircle, Home, IdCard, Image, Inbox, Info, Leaf,
  Instagram, Italic, Key, Landmark, Layers, LayoutDashboard, LayoutGrid,
  LineChart, Linkedin, List, ListChecks, Loader, Loader2, Lock, LogIn,
  LogOut, Mail, Map, MapPin, Maximize, Medal, Menu, MessageCircle,
  MessageSquare, MessageSquareOff, Minus, MonitorPlay, Moon,
  MoreVertical, MousePointerClick, Music, Newspaper, Package, Paperclip,
  Palette, Pause, Pencil, Phone, PhoneCall, PieChart, Plus, PlusCircle,
  Printer, Quote, Receipt, RefreshCw, RotateCcw, Save, Search, SearchX,
  Send, Settings, Share2, Shield, ShieldCheck, ShieldX, ShoppingBag,
  ShoppingCart, Smile, Sparkles, Star, Stethoscope, Store, Tag, ThumbsUp,
  Ticket, Timer, Trash2, TrendingDown, TrendingUp, Trophy, Truck, Twitter,
  Upload, User, UserCheck, UserCircle, UserCog, UserPlus, Users, Video, Wallet,
  X, XCircle, XSquare, Youtube, Zap,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  // Aliases for Phosphor-style names used in public nav
  Storefront: Store,
  Buildings: Building2,
  ChatCircle: MessageCircle,
  ChatCircleDots: MessageSquare,
  ChatCircleText: MessageSquare,
  MessagesSquare: MessageSquare,
  TiktokLogo: MessageCircle,
  WhatsAppLogo: MessageCircle,
  EnvelopeSimple: Mail,
  LockKey: Lock,
  // Aliases for seller panel page icons
  Catalog: LayoutGrid,
  Boxes: Package,
  Sales: ShoppingCart,
  Services: Stethoscope,
  Activity, AlertCircle, AlertOctagon, AlertTriangle, ArrowDown,
  ArrowLeft, ArrowRight, BadgeCheck, Ban, Banknote, BarChart, Bell,
  Bold, BookOpen, Bot, Briefcase, Building, Building2, Clapperboard, Calendar,
  CalendarCheck, CalendarClock, CalendarDays, CalendarSearch, CalendarX,
  Camera, Check, CheckCheck,
  CheckCircle, CheckCircle2, CheckSquare, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, Clock, CloudUpload, Coins, Columns, Contact, CreditCard, Crown, DollarSign,
  Download, Edit, ExternalLink, Eye, EyeOff, Facebook, FileSpreadsheet,
  FileText, FileX, Filter, FolderOpen, FolderTree, Gift, Globe,
  Headphones, Headset, Heart, HelpCircle, Home, IdCard, Image, Inbox, Info, Leaf,
  Instagram, Italic, Key, Landmark, Layers, LayoutDashboard, LayoutGrid,
  LineChart, Linkedin, List, ListChecks, Loader, Loader2, Lock, LogIn,
  LogOut, Mail, Map, MapPin, Maximize, Medal, Menu, MessageCircle,
  MessageSquare, MessageSquareOff, Minus, MonitorPlay, Moon,
  MoreVertical, MousePointerClick, Music, Newspaper, Package, Paperclip,
  Palette, Pause, Pencil, Phone, PhoneCall, PieChart, Plus, PlusCircle,
  Printer, Quote, Receipt, RefreshCw, RotateCcw, Save, Search, SearchX,
  Send, Settings, Share2, Shield, ShieldCheck, ShieldX, ShoppingBag,
  ShoppingCart, Smile, Sparkles, Star, Stethoscope, Store, Tag, ThumbsUp,
  Ticket, Timer, Trash2, TrendingDown, TrendingUp, Trophy, Truck, Twitter,
  Upload, User, UserCheck, UserCircle, UserCog, UserPlus, Users, Video, Wallet,
  X, XCircle, XSquare, Youtube, Zap,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export default function Icon({ name, className, size, style }: IconProps) {
  const LucideIcon = ICON_MAP[name];
  if (!LucideIcon) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Icon] "${name}" no encontrado en ICON_MAP`);
    }
    return <span className={className} style={style} />;
  }
  return <LucideIcon className={className} size={size} style={style} />;
}
