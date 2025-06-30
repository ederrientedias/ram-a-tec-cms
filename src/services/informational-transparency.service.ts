import {
  IInformationalTransparency,
  IFile as ISummaryFile,
  IUpdateSummaries,
  ISimmulatorTable,
} from '@/models/informational-transparency.model';
import informationalTransparencyRepository from '@/repositories/informational-transparency.repository';
import documentsRepository from '@/repositories/products/documents.repository';
import { ICollectionMap, IFile } from '@/models/documents.model';
import { IAnbimaSummaryData } from '@/models/salesforce.model';
import documentService from '@/services/document.service';
import { ISelectedFund } from '@/models/pdf.model';
import { formatText } from '@/lib/format-text';
import { IFund } from '@/models/funds.model';

export interface ISummaryProps {
  idName: string;
  anbimaSummary: IAnbimaSummaryData;
  selectedFund: ISelectedFund;
  fundRef: IFund | null;
  month: string;
  year: string;
  fileUrl: string;
}

export class InformationalTransparencyService {
  private readonly documentRef: string = 'transparencia_informacional';
  protected props: ISummaryProps;

  constructor(props: ISummaryProps) {
    this.props = props;
  }

  public async execute(): Promise<any> {
    return !this.props.fundRef ? this.updateSummariesCollection() : this.handleFullUpdate();
  }

  private async handleFullUpdate(): Promise<any> {
    try {
      return await Promise.all([
        this.updateCollectionMap(),
        this.updateSummaryFile(),
        this.updateInformationalTranparencyTable(),
      ]);
    } catch (error) {
      console.log('❌ handleFullUpdate:', error);
    }
  }

  private async updateCollectionMap(): Promise<boolean> {
    const collectionMap = await documentService.getCollectionsMap(
      this.props.fundRef.collectionName
    );

    if (!collectionMap) {
      return await this.creatCollectionMap(collectionMap || []);
    }

    const isCollectionMap = collectionMap.findIndex(
      (item: ICollectionMap) => item.collectionName === this.documentRef
    );

    if (isCollectionMap !== -1) {
      return await this.updateYearFromCollectionMap(collectionMap);
    } else {
      return await this.creatCollectionMap(collectionMap);
    }
  }

  private async updateSummaryFile(): Promise<boolean> {
    const collectionProps = {
      fundName: this.props.fundRef.collectionName,
      collectionName: this.documentRef,
      year: this.props.year,
    };

    const files = await documentsRepository.getFiles(collectionProps);

    if (files.length === 0) {
      return await this.createFileRef();
    } else {
      return await this.updateFileUrl(files);
    }
  }

  private async updateInformationalTranparencyTable(): Promise<boolean> {
    const informationalTransparencyData =
      await informationalTransparencyRepository.getInformationalTransparency();
    if (informationalTransparencyData.length === 0) {
      return await this.createTranparencyTable();
    } else {
      return await this.updateTranparencyTable(informationalTransparencyData);
    }
  }

  private async updateSummariesCollection(): Promise<[boolean, boolean]> {
    return await Promise.all([this.setSummaryFile(), this.updateInformationalTranparencyTable()]);
  }

  private async updateYearFromCollectionMap(collectionMap: ICollectionMap[]): Promise<boolean> {
    const updatedCollectionMap = collectionMap.map((item) => ({
      ...item,
      years: item.collectionName === this.documentRef ? [this.props.year] : item.years,
    }));
    return await documentService.updateCollectionsMap(
      this.props.fundRef.collectionName,
      updatedCollectionMap
    );
  }

  private async creatCollectionMap(collectionMapRef: ICollectionMap[]): Promise<boolean> {
    const collectionMap = {
      id: collectionMapRef.length + 1,
      bucketName: 'transparencia-informacional',
      collectionName: 'transparencia_informacional',
      displayName: 'Transparência informacional',
      isActive: false,
      isDisabled: false,
      isSelected: false,
      order: 3,
      years: [this.props.year],
    };

    return await documentService.updateCollectionsMap(this.props.fundRef.collectionName, [
      ...collectionMapRef,
      collectionMap,
    ]);
  }

  private async updateFileUrl(filesRef: IFile[]): Promise<boolean> {
    const updatedFiles = filesRef.map((item) => {
      item.file = this.props.fileUrl;
      return item;
    });

    const collectionProps = {
      fundName: this.props.fundRef.collectionName,
      collectionName: this.documentRef,
      year: this.props.year,
      files: updatedFiles,
    };

    return await documentsRepository.setFiles(collectionProps);
  }

  private async createFileRef(): Promise<boolean> {
    const file: IFile = {
      id: crypto.randomUUID(),
      docId: crypto.randomUUID(),
      downloadName: `${this.props.idName}.pdf`,
      month: this.props.month,
      file: this.props.fileUrl,
      name: 'Sumário',
    };

    const collectionProps = {
      fundName: this.props.fundRef.collectionName,
      collectionName: this.documentRef,
      year: this.props.year,
      files: [file],
    };

    return await documentsRepository.setFiles(collectionProps);
  }

  private async createTranparencyTable() {
    try {
      const data = this.getData();
      const simulatorData = this.generateSimulatorTable();
      const fundName = this.props.fundRef.collectionName || this.props.selectedFund.idName;
      await informationalTransparencyRepository.updateInformationalTransparency([data]);
      await informationalTransparencyRepository.setSimulatorDataTable(fundName, simulatorData);
      return true;
    } catch (error) {
      console.log('❌ createTranparencyTable', error);
      return false;
    }
  }

  private async updateTranparencyTable(
    transparencyData: IInformationalTransparency[]
  ): Promise<boolean> {
    try {
      const data = this.getData();
      const simulatorData = this.generateSimulatorTable();
      const fundName = this.props.fundRef
        ? this.props.fundRef.collectionName
        : this.props.selectedFund.idName;
      const selectedFundName = this.props.selectedFund.name;

      const updatedData = transparencyData.map((item) =>
        item.fund.title === selectedFundName ? data : item
      );

      const fundExists = transparencyData.some((item) => item.fund.title === selectedFundName);

      const finalData = fundExists ? updatedData : [...transparencyData, data];

      await informationalTransparencyRepository.updateInformationalTransparency(finalData);
      await informationalTransparencyRepository.setSimulatorDataTable(fundName, simulatorData);
      return true;
    } catch (error) {
      console.log('❌ updateTranparencyTable:', error);
      return false;
    }
  }

  private async setSummaryFile(): Promise<boolean> {
    try {
      const file: ISummaryFile = {
        id: this.props.idName,
        name: 'Sumário',
        downloadName: `${this.props.idName}.pdf`,
        file: this.props.fileUrl,
      };

      const updateSummaryProps: IUpdateSummaries = {
        fundName: formatText(this.props.selectedFund.name),
        month: this.props.month,
        year: this.props.year,
        file,
      };

      await informationalTransparencyRepository.updateSummaries(updateSummaryProps);
      return true;
    } catch (error) {
      return false;
    }
  }

  private getData(): IInformationalTransparency {
    const subtitle = this.props.fundRef
      ? this.props.fundRef?.category
      : this.props.selectedFund.category ?? this.props.selectedFund.subSegment;
    const idName = this.props.fundRef
      ? this.props.fundRef.collectionName
      : this.props.selectedFund.idName;

    const data: IInformationalTransparency = {
      id: this.props.selectedFund.id,
      idName: idName,
      totalFee: this.props.anbimaSummary.valorRemuneracaoTaxaGlobal?.toString() ?? '-',
      managerFee: this.props.anbimaSummary.taxaGestao?.toString() ?? '-',
      administratorFee: this.props.anbimaSummary.taxaAdministracao?.toString() ?? '-',
      flagship: this.props.selectedFund.flagship,
      fund: {
        collumnName: 'Fundos',
        id: 0,
        title: this.props.selectedFund.name || this.props.fundRef.name,
        subtitle: subtitle,
        product: this.props.selectedFund.product,
        type: this.props.selectedFund.type,
        category: this.props.selectedFund.category,
        subSegment: this.props.selectedFund.subSegment,
      },
      admFee: {
        id: 1,
        collumnName: 'Taxa de administração',
        value: !this.props.anbimaSummary.taxaAdministracao
          ? 'Não há'
          : `${this.props.anbimaSummary.taxaAdministracao}%`.replace('.', ','),
        text: this.props.anbimaSummary.administrador
          ? this.props.anbimaSummary.administrador.nomeComercial
          : '',
      },
      managementFee: {
        id: 2,
        collumnName: 'Taxa de gestão',
        value: `${this.props.anbimaSummary.taxaGestao ?? 0}%`.replace('.', ','),
        text: this.props.anbimaSummary.gestor.nome,
      },
      performanceFee: {
        id: 3,
        collumnName: 'Taxa de performance',
        value:
          this.props.anbimaSummary?.taxaPerformance &&
          this.props.anbimaSummary?.taxaPerformance.valorTaxaPerformance > 0
            ? `${this.props.anbimaSummary?.taxaPerformance.valorTaxaPerformance}%`.replace('.', ',')
            : 'Não há',
        text:
          this.props.anbimaSummary?.taxaPerformance &&
          this.props.anbimaSummary?.taxaPerformance.valorTaxaPerformance > 0
            ? this.props.anbimaSummary.taxaPerformance.descricaoTaxaPerformance
                .replace(/^\d+%/, '')
                .trim()
            : '',
      },
      distributorRebate: {
        id: 4,
        collumnName: 'Rebate ao distribuidor',
        rebates: this.props.anbimaSummary.acordosComerciais
          ? this.props.anbimaSummary.acordosComerciais.map((item, index) => {
              return {
                id: index + 1,
                uuid: item.distribuidor.cnpj,
                hasSimulator:
                  item.percentualPL.taxaPerfDistribuidor &&
                  item.percentualPL.taxaPerfDistribuidor > 0
                    ? true
                    : false,
                values: [
                  {
                    id: 1,
                    value:
                      item.percentualPL.taxaAdmDistribuidor &&
                      item.percentualPL.taxaAdmDistribuidor > 0
                        ? `${item.percentualPL.taxaAdmDistribuidor}%`
                        : 'Não há',
                    text: !item.rebateLiquido ? 'Adm. + Gestão' : 'Gestão',
                  },
                  {
                    id: 2,
                    value:
                      item.percentualPL.taxaPerfDistribuidor &&
                      item.percentualPL.taxaPerfDistribuidor > 0
                        ? `${item.percentualPL.taxaPerfDistribuidor}%`
                        : 'Não há',
                    text: 'Performance',
                  },
                ],
              };
            })
          : [
              {
                uuid: '-',
                hasSimulator: false,
                id: 0,
                values: [
                  {
                    value: 'Não há',
                    id: 1,
                    text: 'Adm. + Gestão',
                  },
                  {
                    value: 'Não há',
                    id: 2,
                    text: 'Performance',
                  },
                ],
              },
            ],
      },
      distributors: {
        id: 5,
        collumnName: 'Distribuidores',
        uuid: this.props.fundRef ? this.props.fundRef.collectionName : crypto.randomUUID(),
        options: this.props.anbimaSummary.distribuidores
          ? this.props.anbimaSummary.distribuidores.map((item, index) => {
              return {
                id: index + 1,
                uuid: item.cnpj,
                name: item.nome,
                displayName: item.nomeComercial,
              };
            })
          : [
              {
                id: 0,
                uuid: crypto.randomUUID(),
                displayName: null,
                name: null,
              },
            ],
      },
      summary: {
        id: 6,
        collumnName: 'Sumário Anbima',
        title: 'Sumário',
        link: this.props.fileUrl,
      },
      documents: {
        id: 7,
        collumnName: 'Documentos',
        link: '',
      },
      simulator: {
        id: 8,
        hasSimulator: false,
        collumnName: 'Simulação de cenários',
        uuid: idName,
      },
    };

    return data;
  }

  private generateSimulatorTable(): ISimmulatorTable {
    const managerFee = this.props.anbimaSummary.taxaGestao;
    const adminitratorFee = this.props.anbimaSummary.taxaAdministracao;
    const globalFee = this.props.anbimaSummary.valorRemuneracaoTaxaGlobal;
    //Verifica se existe acordos comerciais
    const hasTradeAgreements = this.props.anbimaSummary.acordosComerciais ? true : false;

    const feesAdmManagementTable = hasTradeAgreements
      ? this.props.anbimaSummary.acordosComerciais.map((item, i) => {
          const feeRef = !item.rebateLiquido ? globalFee : managerFee;
          const distributorFee = feeRef * (item.percentualPL.taxaAdmDistribuidor / 100);

          return {
            id: i,
            name: item.distribuidor.nome,
            uuid: item.distribuidor.cnpj,
            allocation: String(item.percentualPL.taxaAdmDistribuidor / 100),
            manager: {
              pl: String(globalFee - adminitratorFee - distributorFee),
              vl: '0',
            },
            distributor: {
              pl: String(distributorFee),
              vl: '-',
            },
            administration: {
              pl: String(adminitratorFee),
              vl: '-',
            },
            totalFee: {
              pl: '0',
              vl: '-',
            },
          };
        })
      : [];

    const performanceFeeTable = hasTradeAgreements
      ? this.props.anbimaSummary.acordosComerciais.map((item, i) => {
          return {
            id: i,
            name: item.distribuidor.nome,
            uuid: item.distribuidor.cnpj,
            allocation: String(item.percentualPL.taxaAdmDistribuidor / 100),
            manager: {
              pl: '0',
              vl: '-',
            },
            distributor: {
              pl: '0',
              vl: '-',
            },
            administration: {
              pl: '0',
              vl: '-',
            },
            totalFee: {
              pl: '0',
              vl: '-',
            },
          };
        })
      : [];

    const totalFeeTable = hasTradeAgreements
      ? this.props.anbimaSummary.acordosComerciais.map((item, i) => {
          return {
            id: i,
            name: item.distribuidor.nome,
            uuid: item.distribuidor.cnpj,
            allocation: '0',
            manager: {
              pl: '-',
              vl: '-',
            },
            distributor: {
              pl: '-',
              vl: '-',
            },
            administration: {
              pl: '-',
              vl: '-',
            },
            totalFee: {
              pl: '-',
              vl: '-',
            },
          };
        })
      : [];

    return {
      feesAdmManagementTable, //Taxas (Adm. + Gestão)
      performanceFeeTable, //Taxa de Performance
      totalFeeTable, // Taxa Total
    };
  }
}
