// @ts-nocheck
import { editor as MonacoEditor } from 'monaco-editor';
import { ICodeEditorService } from 'monaco-editor/esm/vs/editor/browser/services/codeEditorService';
import { OpenerService } from 'monaco-editor/esm/vs/editor/browser/services/openerService';
import { IModelService } from 'monaco-editor/esm/vs/editor/common/services/modelService.js';
import { IModeService } from 'monaco-editor/esm/vs/editor/common/services/modeService.js';
import { ITextModelService } from 'monaco-editor/esm/vs/editor/common/services/resolverService';
import {
    SimpleEditorModelResolverService,
    SimpleLayoutService,
} from 'monaco-editor/esm/vs/editor/standalone/browser/simpleServices';
import {
    IStandaloneEditorConstructionOptions,
    StandaloneEditor,
} from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeEditor';
import {
    DynamicStandaloneServices,
    IEditorOverrideServices,
    StaticServices,
} from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices';
import { IStandaloneThemeService } from 'monaco-editor/esm/vs/editor/standalone/common/standaloneThemeService';
import { IAccessibilityService } from 'monaco-editor/esm/vs/platform/accessibility/common/accessibility';
import { ICommandService } from 'monaco-editor/esm/vs/platform/commands/common/commands';
import { IConfigurationService } from 'monaco-editor/esm/vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'monaco-editor/esm/vs/platform/contextkey/common/contextkey';
import { IContextViewService } from 'monaco-editor/esm/vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'monaco-editor/esm/vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'monaco-editor/esm/vs/platform/instantiation/common/serviceCollection';
import { IKeybindingService } from 'monaco-editor/esm/vs/platform/keybinding/common/keybinding';
import { ILayoutService } from 'monaco-editor/esm/vs/platform/layout/browser/layoutService';
import { INotificationService } from 'monaco-editor/esm/vs/platform/notification/common/notification';
import { IOpenerService } from 'monaco-editor/esm/vs/platform/opener/common/opener';
import { QuickInputService } from 'monaco-editor/esm/vs/platform/quickinput/browser/quickInput';
import { IQuickInputService } from 'monaco-editor/esm/vs/platform/quickinput/common/quickInput';
import { injectable } from 'tsyringe';

export interface IMonacoService {
    readonly services: ServiceCollection;
    readonly commandService: ICommandService;
    readonly container: HTMLElement | null;
    create(
        domElement: HTMLElement,
        options?: IStandaloneEditorConstructionOptions,
        overrides?: IEditorOverrideServices
    ): MonacoEditor.IStandaloneCodeEditor;
    /**
     * Initial the Workspace, like Services and editor config.
     */
    initWorkspace(container: HTMLElement): void;
}

@injectable()
export class MonacoService implements IMonacoService {
    private _services: ServiceCollection;
    private simpleEditorModelResolverService: SimpleEditorModelResolverService | null = null;
    private _container!: HTMLElement | null;

    constructor() {}

    public initWorkspace(container: HTMLElement) {
        this._container = container;
        this._services = this.createStandaloneServices();
    }

    get container() {
        return this._container;
    }

    get services() {
        return this._services;
    }

    get commandService() {
        return this.services.get(ICommandService);
    }

    private mergeEditorServices(overrides?: IEditorOverrideServices) {
        if (overrides) {
            const services = this.services;
            for (const serviceId in overrides) {
                if (serviceId) {
                    const service = services.get(serviceId);
                    if (service && overrides[serviceId]) {
                        services.set(serviceId, overrides[serviceId]);
                    }
                }
            }
        }
    }

    public create(
        domElement: HTMLElement,
        options?: IStandaloneEditorConstructionOptions,
        overrides?: IEditorOverrideServices
    ): MonacoEditor.IStandaloneCodeEditor {
        const services = this.services;

        this.mergeEditorServices(overrides);
        if (!services.has(ITextModelService)) {
            this.simpleEditorModelResolverService = new SimpleEditorModelResolverService(
                StaticServices.modelService.get()
            );
            services.set(ITextModelService, this.simpleEditorModelResolverService);
        }

        const standaloneEditor = new StandaloneEditor(
            domElement,
            options,
            services,
            services.get(IInstantiationService),
            services.get(ICodeEditorService),
            services.get(ICommandService),
            services.get(IContextKeyService),
            services.get(IKeybindingService),
            services.get(IContextViewService),
            services.get(IStandaloneThemeService),
            services.get(INotificationService),
            services.get(IConfigurationService),
            services.get(IAccessibilityService),
            services.get(IModelService),
            services.get(IModeService)
        );

        if (this.simpleEditorModelResolverService) {
            this.simpleEditorModelResolverService.setEditor(standaloneEditor);
        }

        return standaloneEditor;
    }

    private createStandaloneServices(): ServiceCollection {
        const services = new DynamicStandaloneServices(this.container);
        const instantiationService = services.get(IInstantiationService);

        if (!services.has(IOpenerService)) {
            services.set(
                IOpenerService,
                new OpenerService(services.get(ICodeEditorService), services.get(ICommandService))
            );
        }

        const quickInputService = instantiationService.createInstance(QuickInputService);
        const layoutService = new SimpleLayoutService(
            StaticServices.codeEditorService.get(ICodeEditorService),
            this.container
        );

        // Override layoutService
        services.set(ILayoutService, layoutService);

        // Override quickPickService
        services.set(IQuickInputService, quickInputService);

        return services;
    }
}