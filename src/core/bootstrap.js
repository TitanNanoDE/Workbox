import '../components/ViewPort';
import '../components/ApplicationWindow';
import '../components/EncapsulatedContent';
import System from './System';
import TerminalPackage from '../packages/Terminal/main';

let TerminalApplication = System.PackageLoader.bootstrapPackage(TerminalPackage);
System.ApplicationManager.register(TerminalApplication);
System.ApplicationManager.launch('System::Terminal', System);
