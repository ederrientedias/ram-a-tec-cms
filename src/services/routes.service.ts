import routeRepository from '@/repositories/routes.repository';
import { IRoute } from '@/models/routes.model';


class RoutesService {
  public async getRoutes(): Promise<IRoute[] | []> {
    return await routeRepository.getRoutes();
  }

  public async setRoute(routeData: IRoute): Promise<boolean> {
    const routes = await routeRepository.getRoutes();

    if (!Array.isArray(routes)) {
      return await routeRepository.setRoutes([routeData]);
    }

    const existingRouteIndex = routes.findIndex((r: IRoute) => r.id === routeData.id);

    if (existingRouteIndex !== -1) {
      const updatedRoutes = [...routes];
      updatedRoutes[existingRouteIndex] = routeData;
      return await routeRepository.setRoutes(updatedRoutes);
    }

    return await routeRepository.setRoutes([...routes, routeData]);
  }
}
export default new RoutesService();
