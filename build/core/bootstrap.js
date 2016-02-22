import System from './System.js';
import TerminalPackage from '../packages/Terminal/main.js';

let TerminalApplication = System.PackageLoader.bootstrapPackage(TerminalPackage);
System.ApplicationManager.register(TerminalApplication);
System.ApplicationManager.launch('System::Terminal', System);
