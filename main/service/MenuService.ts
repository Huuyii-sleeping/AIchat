import { ipcMain, Menu, MenuItemConstructorOptions } from "electron";
import logManager from "./LogService";
import { CONFIG_KEYS, IPC_EVENTS } from "@common/constants";
import { cloneDeep } from "@common/utils";
import { createTranslator } from "@main/utils";
import configManager from "./ConfigService";

// 国际化函数
let t: ReturnType<typeof createTranslator> = createTranslator();

/**
 * 菜单管理服务
 * 主要就是统一管理菜单的注册，显示，销毁并支持国际化动态配置
 */
class MenuService {
  private static _instance: MenuService;
  private _menuTemplates: Map<string, MenuItemConstructorOptions[]> = new Map();
  //   当下正在展示的menu
  private _currentMenu?: Menu = void 0;

  private constructor() {
    this._setupIpcListener();
    this._setupLanguageChangeListener();
    logManager.info("MenuService initialized Successfully");
  }

  private _setupIpcListener() {
    // 监听渲染进程发送的消息事件
    // 接收显示的菜单id，并通过Promise在菜单关闭之后返回结果（通知进程菜单已经处理）
    ipcMain.handle(
      IPC_EVENTS.SHOW_CONTEXT_MENU,
      (_, menuId, dynamicOptions?: string) =>
        new Promise((resolve) =>
          this.showMenu(menuId, () => resolve(true), dynamicOptions)
        )
    );
  }

  private _setupLanguageChangeListener() {
    // todo 国际化语言的切换
    configManager.onConfigChange((config) => {
      if (!config[CONFIG_KEYS.LANGUAGE]) return;
      t = createTranslator();
    });
  }

  public static getInstance() {
    if (!this._instance) this._instance = new MenuService();
    return this._instance;
  }

  /**
   * 将菜单模板和menuId绑定并存储到_menuTemplate当中
   * 应用初始化时，提前注册各种场景的菜单，后续直接通过menuId实现快速调用
   * @param menuId
   * @param template
   * @returns
   */
  public register(menuId: string, template: MenuItemConstructorOptions[]) {
    this._menuTemplates.set(menuId, template);
    return menuId;
  }

  /**
   * 直接从注册的模板当中获取菜单，处理国际化和动态参数，最终显示菜单
   * @param menuId
   * @param onClose
   * @param dynamicOptions
   * @returns
   */
  public showMenu(
    menuId: string,
    onClose?: () => void,
    dynamicOptions?: string
  ) {
    if (this._currentMenu) return;
    const template = cloneDeep(this._menuTemplates.get(menuId));
    if (!template) {
      logManager.warn(`Menu ${menuId} not found`);
      onClose?.();
      return;
    }

    // 找到对应的动态参数，例如禁用菜单项或者修改文本之类的，对菜单的内容进行动态的修改
    let _dynamicOptions: Array<
      Partial<MenuItemConstructorOptions> & { id: string }
    > = [];
    try {
      _dynamicOptions = Array.isArray(dynamicOptions)
        ? dynamicOptions
        : JSON.parse(dynamicOptions ?? "[]");
    } catch (error) {
      logManager.error(
        `Failed to parse dynamicOptions for menu ${menuId}: ${error}`
      );
    }

    /**
     * 遍历所有的item，对里面的值进行国际化遍历操作
     * @param item
     * @returns
     */
    const translationItem = (
      item: MenuItemConstructorOptions
    ): MenuItemConstructorOptions => {
      if (item.submenu) {
        return {
          ...item,
          label: t(item?.label) ?? void 0,
          submenu: (item.submenu as MenuItemConstructorOptions[])?.map(
            (item: MenuItemConstructorOptions) => translationItem(item)
          ),
        };
      }

      return {
        ...item,
        label: t(item?.label) ?? void 0,
      };
    };

    // 合并动态参数并完成国际化
    const localizedTemplate = template.map((item) => {
      if (!Array.isArray(_dynamicOptions) || !_dynamicOptions.length) {
        return translationItem(item);
      }
      const dynamicItem = _dynamicOptions.find((_item) => _item.id === item.id);
      if (dynamicItem) {
        const mergedItem = { ...item, ...dynamicItem };
        return translationItem(mergedItem);
      }
      if (item.submenu) {
        return translationItem({
          ...item,
          submenu: (item.submenu as MenuItemConstructorOptions[])?.map(
            (__item: MenuItemConstructorOptions) => {
              const dynamicItem = _dynamicOptions.find(
                (_item) => _item.id === __item.id
              );
              return { ...__item, ...dynamicItem };
            }
          ),
        });
      }
      return translationItem(item);
    });

    const menu = Menu.buildFromTemplate(localizedTemplate);
    this._currentMenu = menu;
    menu.popup({
      // 显示菜单
      callback: () => {
        // 关闭之后执行的回调
        this._currentMenu = void 0;
        onClose?.();
      },
    });
  }

  public destoryMenu(menuId: string) {
    this._menuTemplates.delete(menuId);
  }

  public destoryed() {
    this._menuTemplates.clear();
    this._currentMenu = void 0;
  }
}

export const menuManager = MenuService.getInstance();
export default menuManager;
