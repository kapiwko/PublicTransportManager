<?php

namespace App\Query;

use App\Entity\BusStop;
use App\ViewData\BusStopData;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;

class GetAllBusStopsQuery implements QueryInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @return array|BusStopData[]
     */
    public function __invoke(): array
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->from(BusStop::class, 'busStop');
        $queryBuilder->select(
            'busStop.id',
            'busStop.location',
            'IDENTITY(busStop.group) as group'
        );
        $queryBuilder->groupBy('busStop.id');
        $query = $queryBuilder->getQuery();

        return array_map(function (array $data): BusStopData {
            $group = $data['group'] ? Uuid::fromString($data['group']) : null;
            return new BusStopData($data['id'], $data['location'], $group);
        }, $query->getResult(AbstractQuery::HYDRATE_ARRAY));
    }
}